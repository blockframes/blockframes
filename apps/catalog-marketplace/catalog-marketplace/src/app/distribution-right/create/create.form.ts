import { FormEntity } from '@blockframes/utils';
import { DistributionRight, DistributionLanguage } from '../+state/basket.model';
import { FormArray, FormGroup, FormControl } from '@angular/forms';

export class DistributionRightForm extends FormEntity<DistributionRight> {
  constructor() {
    super({
      medias: new FormArray([]),
      languages: new FormEntity<DistributionLanguage>({}),
      duration: new FormGroup({
        from: new FormControl(),
        to: new FormControl()
      })
    });
  }

  get medias() {
    return this.get('medias');
  }
}
