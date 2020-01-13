import { FormControl } from '@angular/forms';
import { createDistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Injectable } from '@angular/core';
import { DistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';

function createDistributionDealControls(deal: Partial<DistributionDeal>) {
  const entity = createDistributionDeal(deal);
  return {
    exclusive: new FormControl(entity.exclusive),
    territory: new FormControl(entity.territory),
    territoryExcluded: new FormControl(entity.territoryExcluded)
  };
}

type DistributionDealControls = ReturnType<typeof createDistributionDealControls>;

@Injectable()
export class DistributionDealForm extends FormEntity<DistributionDealControls> {
  constructor() {
    super(createDistributionDealControls({}));
  }

  addTerritory(territory: string) {
    const state = this.get('territory').value;
    this.get('territory').setValue([...state, territory]);
    console.log(this.get('territory').value)
  }
}
