import {
  Language,
  Genre,
  MediaValue,
  Territory,
  Certification
} from '@blockframes/utils/static-model/types';
import {
  medias,
  territories,
  StoreType
} from '@blockframes/utils/static-model';
import { Validators, FormArray } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { MovieLanguageSpecification } from '@blockframes/movie/+state/movie.firestore';
import { DistributionRightTermsForm } from '../form/terms/terms.form';
import { FormEntity } from '@blockframes/utils/form';
import { DateRange, Terms } from '@blockframes/utils/common-interfaces';
import { NumberRange } from '@blockframes/utils/static-model/types';

/////////////////////////
// CatalogGenresFilter //
/////////////////////////

export interface CatalogSearch {
  releaseYear: DateRange;
  genres: Genre[];
  productionStatus: string[];
  salesAgent: string[];
  languages: Partial<{ [language in Language]: MovieLanguageSpecification }>;
  certifications: Certification[];
  originCountries: Territory[];
  estimatedBudget: NumberRange[];
  storeType: StoreType[];
  searchbar: {
    text: string;
    type: string;
  };
  seller: string;
}

export interface AvailsSearch {
  terms: Terms;
  territory: Territory[];
  territoryExcluded: Territory[];
  licenseType: MediaValue[];
  exclusive: boolean;
  isActive: boolean;
}

/* ------------- */
/* CREATE OBJECT */
/* ------------- */


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

function createAvailsSearchControl(search: AvailsSearch) {
  return {
    terms: new DistributionRightTermsForm(search.terms),
    licenseType: new FormControl(search.licenseType, Validators.required),
    territory: new FormArray(search.territory.map(territory => new FormControl(territory)), Validators.required),
    territoryExcluded: new FormArray(search.territoryExcluded.map(territory => new FormControl(territory))),
    exclusive: new FormControl(search.exclusive),
    isActive: new FormControl(search.isActive)
  }
}

type AvailsSearchControl = ReturnType<typeof createAvailsSearchControl>;

/* ---- */
/* FROM */
/* ---- */


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

  addTerritory(territory: Territory) {
    // Check it's part of the list available
    if (!Object.keys(territories).includes(territory)) {
      throw new Error(
        `Territory ${territories[territory]} is not part of the list`
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

  checkMedia(checkedMedia: MediaValue) {
    // check if media is already checked by the user
    if (Object.values(medias).includes(checkedMedia) && !this.get('licenseType').value.includes(checkedMedia)) {
      this.get('licenseType').setValue([...this.get('licenseType').value, checkedMedia]);
    } else if (
      Object.values(medias).includes(checkedMedia) &&
      this.get('licenseType').value.includes(checkedMedia)
    ) {
      const checkedMedias = this.get('licenseType').value.filter(
        (alreadyCheckedMedia: MediaValue) => alreadyCheckedMedia !== checkedMedia
      );
      this.get('licenseType').setValue(checkedMedias);
    } else {
      throw new Error(`Media ${medias[checkedMedia]} doesn't exist`);
    }
  }
}
