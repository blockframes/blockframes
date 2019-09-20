import {
  LanguagesLabel,
  CertificationsLabel,
  MediasLabel,
  TerritoriesLabel,
  GenresLabel,
  GENRES_LABEL,
  CERTIFICATIONS_LABEL,
  MEDIAS_LABEL,
  TERRITORIES_LABEL
} from '@blockframes/movie/movie/static-model/types';
import { Validators, FormArray } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { FormEntity, yearValidators, numberRangeValidator } from '@blockframes/utils';

/////////////////////////
// CatalogGenresFilter //
/////////////////////////

// TODO#748: split up the foorms if needed
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
  type: GenresLabel[];
  languages: { [language in LanguagesLabel]: MovieLanguage };
  certifications: CertificationsLabel[];
  medias: MediasLabel[];
  territories: TerritoriesLabel[];
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

  addLanguage(language: LanguagesLabel, value: Partial<MovieLanguage> = {}) {
    const movieLanguage = createMovieLanguage(value);
    this.get('languages').addControl(language, createLanguageControl(movieLanguage));
  }

  removeLanguage(language: LanguagesLabel) {
    this.languages.removeControl(language);
    this.updateValueAndValidity();
  }

  addType(type: GenresLabel) {
    if (!GENRES_LABEL.includes(type)) {
      throw new Error(
        `Type ${type} is not part of the defined types, here is the complete list currently available: ${GENRES_LABEL}`
      );
    } else {
      this.get('type').setValue([...this.get('type').value, type]);
    }
  }

  removeType(type: GenresLabel) {
    if (GENRES_LABEL.includes(type)) {
      const newControls = this.get('type').value.filter(typeToRemove => typeToRemove !== type);
      this.get('type').setValue(newControls);
    } else {
      throw new Error(`The type ${type} was not found!`);
    }
  }

  checkCertification(certificationChecked: CertificationsLabel) {
    // check if certification is already checked by the user
    if (
      CERTIFICATIONS_LABEL.includes(certificationChecked) &&
      !this.get('certifications').value.includes(certificationChecked)
    ) {
      this.get('certifications').setValue([
        ...this.get('certifications').value,
        certificationChecked
      ]);
    } else if (CERTIFICATIONS_LABEL.includes(certificationChecked)) {
      const uncheckCertification = this.get('certifications').value.filter(
        removeCef => removeCef !== certificationChecked
      );
      this.get('certifications').setValue(uncheckCertification);
    } else {
      throw new Error(`Certification ${certificationChecked} doesn't exist`);
    }
  }

  checkMedia(mediaChecked: MediasLabel) {
    // check if media is already checked by the user
    if (MEDIAS_LABEL.includes(mediaChecked) && !this.get('medias').value.includes(mediaChecked)) {
      this.get('medias').setValue([...this.get('medias').value, mediaChecked]);
    } else if (
      MEDIAS_LABEL.includes(mediaChecked) &&
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

  addTerritory(territory: TerritoriesLabel) {
    // Check it's part of the list available
    if (!TERRITORIES_LABEL.includes(territory)) {
      throw new Error(`Territory ${territory} is not part of the list`);
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
}
