import { getLabelByCode } from '@blockframes/movie/movie/static-model/staticModels';
import { TerritoriesSlug, TERRITORIES_SLUG } from '@blockframes/movie/movie/static-model';
import { FormControl, FormArray } from '@angular/forms';
import { createDistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Injectable } from '@angular/core';
import { DistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';

function createDistributionDealControls(deal: Partial<DistributionDeal>) {
  const entity = createDistributionDeal(deal);
  return {
    exclusive: new FormControl(entity.exclusive),
    territory: new FormArray(entity.territory.map(territory => new FormControl(territory))),
    territoryExcluded: new FormArray(entity.territoryExcluded.map(territory => new FormControl(territory))),
  };
}

type DistributionDealControls = ReturnType<typeof createDistributionDealControls>;

@Injectable()
export class DistributionDealForm extends FormEntity<DistributionDealControls> {
  constructor() {
    super(createDistributionDealControls({}));
  }

  addIncludedTerritory(territory: TerritoriesSlug) {
    // Check it's part of the list available
    if (!TERRITORIES_SLUG.includes(territory)) {
      throw new Error(
        `Territory ${getLabelByCode('TERRITORIES', territory)} is not part of the list`
      );
    }
    // Check it's not already in the form control
    const territoriesValue = this.get('territory').value;
    if (!territoriesValue.includes(territory)) {
      this.get('territory').push(new FormControl(territory));
    }
    // Else do nothing as it's already in the list
  }

  addExcludedTerritory(territory: TerritoriesSlug) {
    // Check it's part of the list available
    if (!TERRITORIES_SLUG.includes(territory)) {
      throw new Error(
        `Territory ${getLabelByCode('TERRITORIES', territory)} is not part of the list`
      );
    }
    // Check it's not already in the form control
    const territoriesValue = this.get('territoryExcluded').value;
    if (!territoriesValue.includes(territory)) {
      this.get('territoryExcluded').push(new FormControl(territory));
    }
    // Else do nothing as it's already in the list
  }

  removeIncludedTerritory(index: number) {
    this.get('territory').removeAt(index);
  }

  removeExcludedTerritory(index: number) {
    this.get('territoryExcluded').removeAt(index);
  }
}
