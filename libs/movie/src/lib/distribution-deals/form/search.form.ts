import {
  LanguagesLabel,
  CertificationsLabel,
  TerritoriesLabel,
  LanguagesSlug,
  GenresSlug,
  CertificationsSlug,
  CERTIFICATIONS_SLUG,
  MediasSlug,
  MEDIAS_SLUG,
  TerritoriesSlug,
  TERRITORIES_SLUG,
  MovieStatusLabel,
  MovieStatusSlug,
  MOVIE_STATUS_SLUG
} from '@blockframes/utils/static-model/types';
import { Validators, FormArray } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { MovieLanguageSpecification, StoreType, storeType } from '@blockframes/movie/+state/movie.firestore';
import { createMovieLanguageSpecification } from '@blockframes/movie/+state/movie.model';
import { DistributionDealTermsForm } from '@blockframes/distribution-deals/form/terms/terms.form'
import { FormStaticArray, FormList, FormStaticValue, numberRangeValidator, FormEntity } from '@blockframes/utils/form';
import { NumberRange, DateRange, Terms } from '@blockframes/utils/common-interfaces';

/////////////////////////
// CatalogGenresFilter //
/////////////////////////

export interface CatalogSearch {
  productionYear: DateRange;
  genres: GenresSlug[];
  status: MovieStatusLabel[];
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
}

export interface AvailsSearch {
  terms: Terms;
  territory: TerritoriesSlug[];
  territoryExcluded: TerritoriesSlug[];
  licenseType: MediasSlug[];
  exclusive: boolean;
  isActive: boolean;
}

/* ------------- */
/* CREATE OBJECT */
/* ------------- */

function createCatalogSearch(search: Partial<CatalogSearch> = {}): CatalogSearch {
  return {
    productionYear: {
      from: null,
      to: null
    },
    genres: [],
    status: [],
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
    ...search
  }
}

function createAvailsSearch(search: Partial<AvailsSearch> = {}): AvailsSearch {
  return {
    terms: {
      start: null,
      end: null
    },
    territory: [],
    territoryExcluded: [],
    licenseType: [],
    exclusive: false,
    isActive: false,
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

function createCatalogSearchControl(search: CatalogSearch) {
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
    status: new FormControl(search.status),
    salesAgent: new FormControl(search.salesAgent),
    languages: new FormGroup(languageControl),
    certifications: new FormControl(search.certifications),
    estimatedBudget: new FormControl(search.estimatedBudget),
    originCountries: FormList.factory(search.originCountries, country => new FormStaticValue(country, 'TERRITORIES')),
    storeType: new FormControl(search.storeType),
    searchbar: new FormGroup({
      text: new FormControl(''),
      type: new FormControl('')
    })
  };
}

function createAvailsSearchControl(search: AvailsSearch) {
  return {
    terms: new DistributionDealTermsForm(search.terms),
    licenseType: new FormControl(search.licenseType),
    territory: new FormArray(search.territory.map(territory => new FormControl(territory))),
    territoryExcluded: new FormArray(search.territoryExcluded.map(territory => new FormControl(territory))),
    exclusive: new FormControl(search.exclusive),
    isActive: new FormControl(search.isActive)
  }
}

export type CatalogSearchControl = ReturnType<typeof createCatalogSearchControl>;
export type AvailsSearchControl = ReturnType<typeof createAvailsSearchControl>;

/* ---- */
/* FROM */
/* ---- */

export class CatalogSearchForm extends FormEntity<CatalogSearchControl> {
  constructor(search: Partial<CatalogSearch> = {}) {
    const catalogSearch = createCatalogSearch(search);
    const control = createCatalogSearchControl(catalogSearch);
    super(control);
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
      this.get('status').setValue([...this.get('status').value, status]);
    }
  }

  removeStatus(status: MovieStatusSlug) {
    if (MOVIE_STATUS_SLUG.includes(status)) {
      const newControls = this.get('status').value.filter(
        statusToRemove => statusToRemove !== status
      );
      this.get('status').setValue(newControls);
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

}

// TODO: bind every controls to the form to avoid tricky disable => ISSUE#1942
export class AvailsSearchForm extends FormEntity<AvailsSearchControl> {
  constructor(search: Partial<AvailsSearch> = {}) {
    const availsSearch = createAvailsSearch(search);
    const control = createAvailsSearchControl(availsSearch);
    super(control);
  }

  get exclusive() {
    return this.get('exclusive');
  }

  get licenseType() {
    return this.get('licenseType');
  }

  get territory() {
    return this.get('territory');
  }

  get territoryExcluded() {
    return this.get('territoryExcluded');
  }

  get terms() {
    return this.get('terms');
  }

  set isActive(value: boolean) {
    this.get('isActive').setValue(value);
  }

  addTerritory(territory: TerritoriesSlug) {
    // Check it's part of the list available
    if (!TERRITORIES_SLUG.includes(territory)) {
      throw new Error(
        `Territory ${getLabelBySlug('TERRITORIES', territory)} is not part of the list`
      );
    }
    // Check it's not already in the form control
    const territoriesValue = this.get('territory').value;
    if (!territoriesValue.includes(territory)) {
      this.get('territory').push(new FormControl(territory));
    }
    // Else do nothing as it's already in the list
  }

  removeTerritory(index: number) {
    this.get('territory').removeAt(index);
  }

  checkMedia(checkedMedia: MediasSlug) {
    // check if media is already checked by the user
    if (MEDIAS_SLUG.includes(checkedMedia) && !this.get('licenseType').value.includes(checkedMedia)) {
      this.get('licenseType').setValue([...this.get('licenseType').value, checkedMedia]);
    } else if (
      MEDIAS_SLUG.includes(checkedMedia) &&
      this.get('licenseType').value.includes(checkedMedia)
    ) {
      const checkedMedias = this.get('licenseType').value.filter(
        (alreadyCheckedMedia: MediasSlug) => alreadyCheckedMedia !== checkedMedia
      );
      this.get('licenseType').setValue(checkedMedias);
    } else {
      throw new Error(`Media ${getLabelBySlug('MEDIAS', checkedMedia)} doesn't exist`);
    }
  }
}
