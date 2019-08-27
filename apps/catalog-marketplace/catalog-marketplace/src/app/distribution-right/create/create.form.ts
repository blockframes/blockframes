import { Validators } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';
import { DistributionRight, DistributionLanguage } from '../+state/basket.model';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { staticModels } from '@blockframes/movie';

<<<<<<< HEAD
const movieTerritories = staticModels['TERRITORIES'].map(key => key.slug);
=======
const movieTerritories = staticModels['TERRITORIES'].map(key => key.slug)
>>>>>>> 58246fd8010f5b5500080ed10d32da635192f35f

export class DistributionRightForm extends FormEntity<DistributionRight> {
  constructor() {
    super({
      medias: new FormArray([]),
      languages: new FormEntity<DistributionLanguage>({}),
      duration: new FormGroup({
        from: new FormControl(null, [Validators.minLength(4), Validators.maxLength(5), Validators.min(2018)]),
        to: new FormControl(null, [Validators.minLength(4), Validators.maxLength(5)])
      }),
      territories: new FormArray([])
    });
  }

  get medias() {
    return this.get('medias');
  }

<<<<<<< HEAD
  /*   addTerritory(territory: string) {
=======

/*   addTerritory(territory: string) {
>>>>>>> 58246fd8010f5b5500080ed10d32da635192f35f
    // Check it's part of the list available
    if (!movieTerritories.includes(territory as Territories)) {
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
  } */
}
