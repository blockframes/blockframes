import { FormList } from '@blockframes/utils/form/forms/list.form';
import { FormControl } from '@angular/forms';
import { createDistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { DistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { DistributionDealTermsForm } from './terms/terms.form';
import { DistributionDealHoldbacksForm } from './holdbacks/holdbacks.form';
import { MovieVersionInfoForm } from '@blockframes/movie/movie/form/version-info/version-info.form';


function createDistributionDealControls(deal: Partial<DistributionDeal>) {
  const entity = createDistributionDeal(deal);
  return {
    id: new FormControl(entity.id),
    contractId: new FormControl(entity.contractId),
    exclusive: new FormControl(entity.exclusive),
    territory: FormList.factory(entity.territory),
    territoryExcluded: FormList.factory(entity.territoryExcluded),
    licenseType: new FormControl(entity.licenseType),
    terms: new DistributionDealTermsForm(entity.terms),
    holdbacks: FormList.factory(entity.holdbacks, holdback => new DistributionDealHoldbacksForm(holdback)),
    assetLanguage: new MovieVersionInfoForm(deal.assetLanguage),
    multidiffusion: FormList.factory(entity.multidiffusion, multi => new DistributionDealTermsForm(multi)),
    catchUp: new DistributionDealTermsForm(entity.catchUp),
    download: new FormControl(entity.download)
  };
}

type DistributionDealControls = ReturnType<typeof createDistributionDealControls>;

export class DistributionDealForm extends FormEntity<DistributionDealControls> {
  constructor(deal: Partial<DistributionDeal> = {}) {
    super(createDistributionDealControls(deal));
  }

  get territory() {
    return this.get('territory');
  }
}
