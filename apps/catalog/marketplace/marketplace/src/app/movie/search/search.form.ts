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
  TERRITORIES_SLUG
} from '@blockframes/movie/movie/static-model/types';
import { Validators, FormArray } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { FormEntity, yearValidators, numberRangeValidator } from '@blockframes/utils';
import { getLabelByCode } from '@blockframes/movie/movie/static-model/staticModels';

/////////////////////////
// CatalogGenresFilter //
/////////////////////////

export interface MovieLanguageSpecification {
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
  languages: { [language in LanguagesLabel]: MovieLanguageSpecification };
  certifications: CertificationsLabel[];
  medias: MediasLabel[];
  territories: TerritoriesLabel[];
}

/* ------------- */
/* CREATE OBJECT */
/* ------------- */

export function createMovieLanguage(
  movieLanguage: Partial<MovieLanguageSpecification> = {}
): MovieLanguageSpecification {
  return {
    original: false,
    dubbed: false,
    subtitle: false,
    ...movieLanguage
  } as MovieLanguageSpecification;
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

export function createLanguageControl(language: MovieLanguageSpecification, disableDubbed?: boolean) {
  return new FormGroup({
    original: new FormControl(language.original),
    dubbed: new FormControl({ value: language.dubbed, disabled: disableDubbed }),
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

  addLanguage(language: LanguagesSlug, value: Partial<MovieLanguageSpecification> = {}) {
    const movieLanguage = createMovieLanguage(value);
    this.get('languages').addControl(language, createLanguageControl(movieLanguage));
  }

  removeLanguage(language: LanguagesSlug) {
    this.languages.removeControl(language);
    this.updateValueAndValidity();
  }

  addType(type: GenresSlug) {
    if (!GENRES_SLUG.includes(type)) {
      throw new Error(
        `Type ${type} is not part of the defined types, here is the complete list currently available: ${GENRES_LABEL}`
      );
    } else {
      this.get('type').setValue([...this.get('type').value, type]);
    }
  }

  removeType(type: GenresSlug) {
    if (GENRES_SLUG.includes(type)) {
      const newControls = this.get('type').value.filter(typeToRemove => typeToRemove !== type);
      this.get('type').setValue(newControls);
    } else {
      throw new Error(`The type ${type} was not found!`);
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
        `Territory ${getLabelByCode('TERRITORIES', territory)} is not part of the list`
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
}
