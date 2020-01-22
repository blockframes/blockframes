import { FormList } from '@blockframes/utils/form/forms/list.form';
import { getLabelByCode } from '@blockframes/utils/static-model/staticModels';
import { TerritoriesSlug, TERRITORIES_SLUG } from '@blockframes/utils/static-model';
import { FormControl } from '@angular/forms';
import { createDistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Injectable } from '@angular/core';
import { DistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { TerritoryType } from './territory/territory.component';
import { DistributionDealTermsForm } from './terms/terms.form';

function createDistributionDealControls(deal: Partial<DistributionDeal>) {
  const entity = createDistributionDeal(deal);
  return {
    exclusive: new FormControl(entity.exclusive),
    territory: FormList.factory(entity.territory),
    territoryExcluded: FormList.factory(entity.territoryExcluded),
    licenseType: FormList.factory(deal.licenseType),
    terms: new DistributionDealTermsForm(deal.terms)
  };
}

type DistributionDealControls = ReturnType<typeof createDistributionDealControls>;

@Injectable()
export class DistributionDealForm extends FormEntity<DistributionDealControls> {
  constructor() {
    super(createDistributionDealControls({}));
  }

  addTerritory(territory: TerritoriesSlug, type: TerritoryType) {
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
  removeTerritory(index: number, type: TerritoryType) {
    this.get(type).removeAt(index);
  }
}
