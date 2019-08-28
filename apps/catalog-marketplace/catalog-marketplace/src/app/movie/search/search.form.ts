import { Validators, FormArray } from '@angular/forms';
import { MovieMedias, MovieTerritories } from './search.form';
import { FormGroup, FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';
import { staticModels } from '@blockframes/movie';

/////////////////////////
// CatalogGenresFilter //
/////////////////////////

// TODO#748: split up the foorms
const movieTypes = staticModels['GENRES'].map(key => key.label);
export const movieLanguages = staticModels['LANGUAGES'].map(key => key.label);
const movieCertifications = staticModels['CERTIFICATIONS'].map(key => key.label);
const movieMedias = staticModels['MEDIAS'].map(key => key.label);
const movieTerritories = staticModels['TERRITORIES'].map(key => key.label);

export type MovieType = typeof movieTypes[number];

export type Certifications = typeof movieCertifications[number];

export type Language = typeof movieLanguages[number];

export type MovieMedias = typeof movieMedias[number];

export type MovieTerritories = typeof movieTerritories[number];

export interface MovieLanguage {
  original: boolean;
  dubbed: boolean;
  subtitle: boolean;
}

export interface CatalogSearch {
  productionYear: {
    from: number;
    to: number;
  };
  availabilities: {
    from: Date;
    to: Date;
  };
  type: MovieType[];
  languages: { [language in Language]: MovieLanguage };
  certifications: Certifications[];
  medias: MovieMedias[];
  territories: MovieTerritories[];
}

/* ------------- */
/* CREATE OBJECT */
/* ------------- */

function createMovieLanguage(movieLanguage: Partial<MovieLanguage> = {}): MovieLanguage {
  return {
    original: false,
    dubbed: false,
    subtitle: false,
    ...movieLanguage
  } as MovieLanguage;
}

function createCatalogSearch(search: Partial<CatalogSearch>): CatalogSearch {
  return {
    productionYear: {},
    availabilities: {},
    type: [],
    languages: {},
    certifications: [],
    medias: [],
    territories: [],
    ...search
  } as CatalogSearch;
}

/* -------------- */
/* CREATE CONTROL */
/* -------------- */

function createLanguageControl(language: MovieLanguage) {
  return new FormGroup({
    original: new FormControl(language.original),
    dubbed: new FormControl(language.dubbed),
    subtitle: new FormControl(language.subtitle)
  });
}
function createCatalogSearchControl(search: CatalogSearch) {
  // Create controls for the languages
  const languageControl = Object.keys(search.languages).reduce(
    (acc, key) => ({
      ...acc,
      [key]: createLanguageControl(search.languages[key])
    }),
    {}
  );
  return {
    productionYear: new FormGroup({
      from: new FormControl(search.productionYear.from, [
        Validators.minLength(4),
        Validators.maxLength(4)
      ]),
      to: new FormControl(search.productionYear.to, [
        Validators.max(2019),
        Validators.minLength(4),
        Validators.maxLength(5)
      ])
    }),
    availabilities: new FormGroup({
      from: new FormControl(search.availabilities.from, [Validators.min(2018)]),
      to: new FormControl(search.availabilities.to)
    }),
    type: new FormControl(search.type),
    languages: new FormGroup(languageControl),
    certifications: new FormControl(search.certifications),
    medias: new FormControl(search.medias),
    territories: new FormArray(search.territories.map(territory => new FormControl(territory)))
  };
}
export type CatalogSearchControl = ReturnType<typeof createCatalogSearchControl>;

/* ---- */
/* FROM */
/* ---- */

export class CatalogSearchForm extends FormEntity<CatalogSearch, CatalogSearchControl> {
  constructor(search: Partial<CatalogSearch> = {}) {
    const catalogSearch = createCatalogSearch(search);
    const control = createCatalogSearchControl(catalogSearch);
    super(control);
  }

  get languages() {
    return this.get('languages') as FormGroup;
  }

  addLanguage(language: Language, value: Partial<MovieLanguage> = {}) {
    const movieLanguage = createMovieLanguage(value);
    this.get('languages').addControl(language, createLanguageControl(movieLanguage));
  }

  removeLanguage(language: Language) {
    this.languages.removeControl(language);
    this.updateValueAndValidity();
  }

  addType(type: MovieType) {
    if (!movieTypes.includes(type)) {
      throw new Error(
        `Type ${type} is not part of the defined types, here is the complete list currently available: ${movieTypes}`
      );
    } else {
      this.get('type').setValue([...this.get('type').value, type]);
    }
  }

  removeType(type: MovieType) {
    if (movieTypes.includes(type)) {
      const newControls = this.get('type').value.filter(typeToRemove => typeToRemove !== type);
      this.get('type').setValue(newControls);
    } else {
      throw new Error(`The type ${type} was not found!`);
    }
  }

  checkCertification(certificationChecked: Certifications) {
    // check if certification is already checked by the user
    if (
      movieCertifications.includes(certificationChecked) &&
      !this.get('certifications').value.includes(certificationChecked)
    ) {
      this.get('certifications').setValue([
        ...this.get('certifications').value,
        certificationChecked
      ]);
    } else if (movieCertifications.includes(certificationChecked)) {
      const uncheckCertification = this.get('certifications').value.filter(
        removeCef => removeCef !== certificationChecked
      );
      this.get('certifications').setValue(uncheckCertification);
    } else {
      throw new Error(`Certification ${certificationChecked} doesn't exist`);
    }
  }

  checkMedia(mediaChecked: MovieMedias) {
    // check if media is already checked by the user
    if (movieMedias.includes(mediaChecked) && !this.get('medias').value.includes(mediaChecked)) {
      this.get('medias').setValue([...this.get('medias').value, mediaChecked]);
    } else if (
      movieMedias.includes(mediaChecked) &&
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

  addTerritory(territory: MovieTerritories) {
    // Check it's part of the list available
    if (!movieTerritories.includes(territory)) {
      throw new Error(`Territory ${territory} is not part of the list`);
    }
    // Check it's not already in the form control
    const territories = this.get('territories').value;
    if (!territories.includes(territory)) {
      this.get('territories').push(new FormControl(territory));
    }
    // Else do nothing as it's already in the list
  }

  removeTerritory(index: number) {
    this.get('territories').removeAt(index);
  }
}
