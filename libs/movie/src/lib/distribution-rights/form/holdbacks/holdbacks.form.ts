import { FormControl } from '@angular/forms';
import { HoldbackWithDates as Holdback } from '../../+state/distribution-right.firestore';
import { DistributionRightTermsForm } from '../terms/terms.form';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createholdbacksControl(holdback: Partial<Holdback>) {
    return {
        media: new FormControl(holdback.media),
        terms: new DistributionRightTermsForm(holdback.terms)
    }
  }

  type DistributionRightHoldbacksControl = ReturnType<typeof createholdbacksControl>;

  export class DistributionRightHoldbacksForm extends FormEntity<DistributionRightHoldbacksControl>{
    constructor(holdback: Partial<Holdback> = {}){
        super(createholdbacksControl(holdback))
    }
  }
