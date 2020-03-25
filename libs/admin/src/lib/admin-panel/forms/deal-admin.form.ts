import { FormControl, Validators } from '@angular/forms';
import { createDistributionDeal, DistributionDeal } from '@blockframes/distribution-deals';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';


function createDealAdminControls(entity: Partial<DistributionDeal>) {
  const deal = createDistributionDeal(entity);
  return {
    status: new FormControl(deal.status),
    contractId: new FormControl(deal.contractId, [
      Validators.required
    ]),
    exclusive: new FormControl(deal.exclusive),
  };
}

type DealAdminControl = ReturnType<typeof createDealAdminControls>;

export class DealAdminForm extends FormEntity<DealAdminControl> {
  constructor(data?: DistributionDeal) {
    super(createDealAdminControls(data));
  }
}
