import { FormList } from '@blockframes/utils/form/forms/list.form';
import { getLabelByCode } from '@blockframes/movie/movie/static-model/staticModels';
import { TerritoriesSlug, TERRITORIES_SLUG } from '@blockframes/movie/movie/static-model';
import { FormControl } from '@angular/forms';
import { createDistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Injectable } from '@angular/core';
import { DistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';

function createDistributionDealControls(deal: Partial<DistributionDeal>) {
  const entity = createDistributionDeal(deal);
  return {
    exclusive: new FormControl(entity.exclusive),
    territory: FormList.factory(entity.territory),
    territoryExcluded: FormList.factory(entity.territoryExcluded)
  };
}

type DistributionDealControls = ReturnType<typeof createDistributionDealControls>;

@Injectable()
export class DistributionDealForm extends FormEntity<DistributionDealControls> {
  constructor() {
    super(createDistributionDealControls({}));
  }

  addTerritory(territory: TerritoriesSlug, type: 'territory' | 'territoryExcluded') {
    if (!TERRITORIES_SLUG.includes(territory)) {
      throw new Error(
        `Territory ${getLabelByCode('TERRITORIES', territory)} is not part of the list`
      );
    }
    const territories = this.get(type).value;
    if (!territories.includes(territory)) {
      this.get(type).push(new FormControl(territory));
    }
  }
  removeTerritory(index: number, type: 'territory' | 'territoryExcluded') {
    this.get(type).removeAt(index);
  }
}
