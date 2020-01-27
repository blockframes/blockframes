import { FormList } from '@blockframes/utils/form/forms/list.form';
import { FormControl } from '@angular/forms';
import { createDistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Injectable } from '@angular/core';
import { DistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { DistributionDealTermsForm } from './terms/terms.form';


function createDistributionDealControls(deal: Partial<DistributionDeal>) {
  const entity = createDistributionDeal(deal);
  return {
    exclusive: new FormControl(entity.exclusive),
    territory: FormList.factory(entity.territory),
    territoryExcluded: FormList.factory(entity.territoryExcluded),
    licenseType: new FormControl(entity.licenseType),
    terms: new DistributionDealTermsForm(deal.terms)
  };
}

type DistributionDealControls = ReturnType<typeof createDistributionDealControls>;

@Injectable()
export class DistributionDealForm extends FormEntity<DistributionDealControls> {
  constructor(deal: Partial<DistributionDeal> = {}) {
    super(createDistributionDealControls({}));
  }
}
