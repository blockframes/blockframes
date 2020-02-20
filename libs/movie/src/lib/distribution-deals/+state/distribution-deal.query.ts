import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { DistributionDeal, getDealTerritories } from './distribution-deal.model';
import { DistributionDealStore, DistributionDealState } from './distribution-deal.store';
import { ContractVersion } from '@blockframes/contract/version/+state';

@Injectable({ providedIn: 'root' })
export class DistributionDealQuery extends QueryEntity<DistributionDealState, DistributionDeal> {
  constructor(protected store: DistributionDealStore) {
    super(store);
  }

  /**
   * Returns all eligible territories from contract's deals.
   * @param contractVersion
   */
  public getTerritoriesFromContract(contractVersion: ContractVersion): string[] {
    // Get all the deals from the contract titles.
    const deals = Object.values(contractVersion.titles).map(({ distributionDealIds }) =>
      this.getEntity(distributionDealIds)
    );
    // Returns all deals eligible territories as an array of string.
    return deals.map(deal => deal ? getDealTerritories(deal) : []).flat();
  }
}
