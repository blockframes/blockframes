import {
  LanguagesLabel,
  CertificationsLabel,
  TerritoriesLabel,
  LanguagesSlug,
  GenresSlug,
  CertificationsSlug,
  CERTIFICATIONS_SLUG,
  MovieStatusLabel,
  MovieStatusSlug,
  MOVIE_STATUS_SLUG
} from '@blockframes/utils/static-model/types';
import { Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { MovieLanguageSpecification, StoreType, storeType } from '@blockframes/movie/+state/movie.firestore';
import { createMovieLanguageSpecification } from '@blockframes/movie/+state/movie.model';
import { FormStaticArray, FormList, FormStaticValue, numberRangeValidator, FormEntity } from '@blockframes/utils/form';
import { NumberRange, DateRange } from '@blockframes/utils/common-interfaces';

/////////////////////////
// CatalogGenresFilter //
/////////////////////////

export interface MovieSearch {
  productionYear: DateRange;
  genres: GenresSlug[];
  productionStatus: MovieStatusLabel[];
  salesAgent: string[];
  languages: Partial<{ [language in LanguagesLabel]: MovieLanguageSpecification }>;
  certifications: CertificationsLabel[];
  originCountries: TerritoriesLabel[];
  estimatedBudget: NumberRange[];
  storeType: StoreType[];
  searchbar: {
    text: string;
    type: string;
  };
  seller: string;
}

/* ------------- */
/* CREATE OBJECT */
/* ------------- */

function createMovieSearch(search: Partial<MovieSearch> = {}): MovieSearch {
  return {
    productionYear: {
      from: null,
      to: null
    },
    genres: [],
    productionStatus: [],
    salesAgent: [],
    languages: {},
    certifications: [],
    originCountries: [],
    estimatedBudget: [],
    storeType: [],
    searchbar: {
      text: '',
      type: ''
    },
    seller: '',
    ...search
  }
}

/* -------------- */
/* CREATE CONTROL */
/* -------------- */

export function createLanguageControl(
  language: MovieLanguageSpecification,
  disableDubbed?: boolean
) {
  return new FormGroup({
    original: new FormControl(language.original),
    dubbed: new FormControl({ value: language.dubbed, disabled: disableDubbed }),
    subtitle: new FormControl(language.subtitle),
    caption: new FormControl(language.caption)
  });
}

function createTermsControl(terms: DateRange) {
  return new FormGroup(
    {
      from: new FormControl(terms.from, [
        Validators.min(new Date().getFullYear())
      ]),
      to: new FormControl(terms.to)
    },
    numberRangeValidator('from', 'to')
  )
}

function createMovieSearchControl(search: MovieSearch) {
  // Create controls for the languages
  const languageControl = Object.keys(search.languages).reduce(
    (acc, key) => ({
      ...acc,
      // Key is the name of the language, english, french etc.
      [key]: createLanguageControl(search.languages[key])
    }),
    {} // Initial value. No controls at the beginning
  );
  return {
    productionYear: createTermsControl(search.productionYear),
    genres: new FormStaticArray(search.genres, 'GENRES', [Validators.required]),
    productionStatus: new FormControl(search.productionStatus),
    salesAgent: new FormControl(search.salesAgent),
    languages: new FormGroup(languageControl),
    certifications: new FormControl(search.certifications),
    estimatedBudget: new FormControl(search.estimatedBudget),
    originCountries: FormList.factory(search.originCountries, country => new FormStaticValue(country, 'TERRITORIES')),
    storeType: new FormControl(search.storeType),
    searchbar: new FormGroup({
      text: new FormControl(''),
      type: new FormControl('')
    }),
    seller: new FormControl(search.seller),
  };
}

export type MovieSearchControl = ReturnType<typeof createMovieSearchControl>;

/* ---- */
/* FROM */
/* ---- */

export class MovieSearchForm extends FormEntity<MovieSearchControl> {
  constructor(search: Partial<MovieSearch> = {}) {
    const catalogSearch = createMovieSearch(search);
    const control = createMovieSearchControl(catalogSearch);
    super(control);
  }

  get search() {
    return this.get('searchbar').get('text');
  }

  get genres() {
    return this.get('genres');
  }

  get languages() {
    return this.get('languages');
  }

  get originCountries() {
    return this.get('originCountries');
  }

  get productionStatus() {
    return this.get('productionStatus');
  }

  get budget() {
    return this.get('estimatedBudget');
  }

  addLanguage(language: LanguagesSlug, value: Partial<MovieLanguageSpecification> = {}) {
    const movieLanguage = createMovieLanguageSpecification(value);
    this.get('languages').addControl(language, createLanguageControl(movieLanguage));
  }

  removeLanguage(language: LanguagesSlug) {
    this.languages.removeControl(language);
    this.updateValueAndValidity();
  }

  addStatus(status: MovieStatusSlug) {
    if (!MOVIE_STATUS_SLUG.includes(status)) {
      throw new Error(
        `Production status ${status} is not part of the defined status, here is the complete list currently available: ${MOVIE_STATUS_SLUG}`
      );
    } else {
      this.productionStatus.setValue([...this.productionStatus.value, status]);
    }
  }

  removeStatus(status: MovieStatusSlug) {
    if (MOVIE_STATUS_SLUG.includes(status)) {
      const newControls = this.get('productionStatus').value.filter(
        statusToRemove => statusToRemove !== status
      );
      this.get('productionStatus').setValue(newControls);
    } else {
      throw new Error(`The production status ${status} was not found!`);
    }
  }

  checkCertification(certificationChecked: CertificationsSlug) {
    // check if certification is already checked by the user
    if (
      CERTIFICATIONS_SLUG.includes(certificationChecked) &&
      !this.get('certifications').value.includes(certificationChecked)
    ) {
      this.get('certifications').setValue([
        ...this.get('certifications').value,
        certificationChecked
      ]);
    } else if (CERTIFICATIONS_SLUG.includes(certificationChecked)) {
      const uncheckCertification = this.get('certifications').value.filter(
        removeCef => removeCef !== certificationChecked
      );
      this.get('certifications').setValue(uncheckCertification);
    } else {
      throw new Error(`Certification ${certificationChecked} doesn't exist`);
    }

  }

  checkStoreType(type: StoreType) {
    // check if media is already checked by the user
    if (!this.get('storeType').value.includes(storeType)) {
      this.get('storeType').setValue([...this.get('storeType').value, storeType]);
    } else if ( this.get('storeType').value.includes(storeType)) {
        const types = this.get('storeType').value.filter(
          (alreadyCheckedStoreType: StoreType) => alreadyCheckedStoreType !== type
        );
        this.get('storeType').setValue(types);
    } else {
      throw new Error(`Store Type ${storeType[type]} doesn't exist`);
    }
  }

  get seller() {
    return this.get('seller');
  }

}
