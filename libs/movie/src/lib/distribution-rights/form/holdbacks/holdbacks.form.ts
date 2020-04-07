import { FormControl } from '@angular/forms';
import { HoldbackWithDates as Holdback } from '../../+state/distribution-right.firestore';
import { DistributionDealTermsForm } from '../terms/terms.form';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createholdbacksControl(holdback: Partial<Holdback>) {
    return {
        media: new FormControl(holdback.media),
        terms: new DistributionDealTermsForm(holdback.terms)
    }
  }

  type DistributionDealHoldbacksControl = ReturnType<typeof createholdbacksControl>;

  export class DistributionDealHoldbacksForm extends FormEntity<DistributionDealHoldbacksControl>{
    constructor(holdback: Partial<Holdback> = {}){
        super(createholdbacksControl(holdback))
    }
  }
