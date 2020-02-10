import {
  LanguagesLabel,
  CertificationsLabel,
  MediasLabel,
  TerritoriesLabel,
  GenresLabel,
  GENRES_LABEL,
  LanguagesSlug,
  GenresSlug,
  GENRES_SLUG,
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
import { FormEntity, yearValidators, numberRangeValidator } from '@blockframes/utils';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { MovieLanguageSpecification } from '@blockframes/movie/movie/+state/movie.firestore';
import { createMovieLanguageSpecification } from '@blockframes/movie/movie+state/movie.model';
import { FormStaticArray } from '@blockframes/utils/form';
import { NumberRange } from '@blockframes/utils/common-interfaces';

/////////////////////////
// CatalogGenresFilter //
/////////////////////////

export interface CatalogSearch {
  productionYear: {
    from: number;
    to: number;
  };
  availabilities: {
    from: Date;
    to: Date;
  };
  genres: GenresSlug[];
  status: MovieStatusLabel[];
  languages: { [language in LanguagesLabel]: MovieLanguageSpecification };
  certifications: CertificationsLabel[];
  medias: MediasLabel[];
  territories: TerritoriesLabel[];
  originCountries: TerritoriesLabel[];
  estimatedBudget: NumberRange[];
  searchbar: {
    text: string;
    type: string;
  };
}

/* ------------- */
/* CREATE OBJECT */
/* ------------- */

function createCatalogSearch(search: Partial<CatalogSearch>): CatalogSearch {
  return {
    productionYear: {},
    availabilities: {},
    genres: [],
    status: [],
    salesAgent: [],
    languages: {},
    certifications: [],
    medias: [],
    territories: [],
    originCountries: [],
    searchbar: {},
    estimatedBudget: [],
    ...search
  } as CatalogSearch;
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
    productionYear: new FormGroup(
      {
        from: new FormControl(search.productionYear.from, [
          yearValidators,
          Validators.max(new Date().getFullYear())
        ]),
        to: new FormControl(search.productionYear.to, [yearValidators])
      },
      numberRangeValidator('from', 'to')
    ),
    availabilities: new FormGroup(
      {
        from: new FormControl(search.availabilities.from, [
          Validators.min(new Date().getFullYear())
        ]),
        to: new FormControl(search.availabilities.to)
      },
      numberRangeValidator('from', 'to')
    ),
    genres: new FormStaticArray(search.genres, 'GENRES', [Validators.required]),
    status: new FormControl(search.status),
    languages: new FormGroup(languageControl),
    certifications: new FormControl(search.certifications),
    medias: new FormControl(search.medias),
    estimatedBudget: new FormControl(search.estimatedBudget),
    territories: new FormArray(search.territories.map(territory => new FormControl(territory))),
    originCountries: new FormArray(search.originCountries.map(country => new FormControl(country))),
    searchbar: new FormGroup({
      text: new FormControl(''),
      type: new FormControl('')
    })
  };
}
export type CatalogSearchControl = ReturnType<typeof createCatalogSearchControl>;

/* ---- */
/* FROM */
/* ---- */

export class CatalogSearchForm extends FormEntity<CatalogSearchControl> {
  constructor(search: Partial<CatalogSearch> = {}) {
    const catalogSearch = createCatalogSearch(search);
    const control = createCatalogSearchControl(catalogSearch);
    super(control);
  }

  get languages() {
    return this.get('languages') as FormGroup;
  }

  get genres() {
    return this.get('genres');
  }

  addLanguage(language: LanguagesSlug, value: Partial<MovieLanguageSpecification> = {}) {
    const movieLanguage = createMovieLanguageSpecification(value);
    this.get('languages').addControl(language, createLanguageControl(movieLanguage));
  }

  removeLanguage(language: LanguagesSlug) {
    this.languages.removeControl(language);
    this.updateValueAndValidity();
  }

  addGenre(genre: GenresSlug) {
    if (!GENRES_SLUG.includes(genre)) {
      throw new Error(
        `Genre ${genre} is not part of the defined genres, here is the complete list currently available: ${GENRES_LABEL}`
      );
    } else {
      this.get('genres').setValue([...this.get('genres').value, genre]);
    }
  }

  removeGenre(genre: GenresSlug) {
    if (GENRES_SLUG.includes(genre)) {
      const newControls = this.get('genres').value.filter(genreToRemove => genreToRemove !== genre);
      this.get('genres').setValue(newControls);
    } else {
      throw new Error(`The genre ${genre} was not found!`);
    }
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

  addSalesAgent(salesAgent: string) {
    this.get('salesAgent').setValue([...this.get('salesAgent').value, salesAgent]);
  }

  removeSalesAgent(salesAgent: string) {
    const newControls = this.get('salesAgent').value.filter(
      salesAgentToRemove => salesAgentToRemove !== salesAgent
    );
    this.get('salesAgent').setValue(newControls);
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

  checkMedia(mediaChecked: MediasSlug) {
    // check if media is already checked by the user
    if (MEDIAS_SLUG.includes(mediaChecked) && !this.get('medias').value.includes(mediaChecked)) {
      this.get('medias').setValue([...this.get('medias').value, mediaChecked]);
    } else if (
      MEDIAS_SLUG.includes(mediaChecked) &&
      this.get('medias').value.includes(mediaChecked)
    ) {
      const uncheckMedia = this.get('medias').value.filter(
        removeMedia => removeMedia !== mediaChecked
      );
      this.get('medias').setValue(uncheckMedia);
    } else {
      throw new Error(`Media ${mediaChecked} doesn't exist`);
    }
  }

  addTerritory(territory: TerritoriesSlug) {
    // Check it's part of the list available
    if (!TERRITORIES_SLUG.includes(territory)) {
      throw new Error(
        `Territory ${getLabelBySlug('TERRITORIES', territory)} is not part of the list`
      );
    }
    // Check it's not already in the form control
    const territoriesValue = this.get('territories').value;
    if (!territoriesValue.includes(territory)) {
      this.get('territories').push(new FormControl(territory));
    }
    // Else do nothing as it's already in the list
  }

  removeTerritory(index: number) {
    this.get('territories').removeAt(index);
  }

  addCountry(country: TerritoriesSlug) {
    // Check it's part of the list available
    if (!TERRITORIES_SLUG.includes(country)) {
      throw new Error(
        `Country ${getLabelBySlug('TERRITORIES', country)} is not part of the list`
      );
    }
    // Check it's not already in the form control
    const territoriesValue = this.get('originCountries').value;
    if (!territoriesValue.includes(country)) {
      this.get('originCountries').push(new FormControl(country));
    }
    // Else do nothing as it's already in the list
  }

  removeCountry(index: number) {
    this.get('originCountries').removeAt(index);
  }
}
