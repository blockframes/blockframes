import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { DistributionRight, getRightTerritories } from './distribution-right.model';
import { DistributionRightStore, DistributionRightState } from './distribution-right.store';
import { ContractVersion } from '@blockframes/contract/version/+state';

@Injectable({ providedIn: 'root' })
export class DistributionRightQuery extends QueryEntity<DistributionRightState, DistributionRight> {
  constructor(protected store: DistributionRightStore) {
    super(store);
  }

  /**
   * Returns all eligible territories from contract's rights.
   * @param contractVersion
   */
  public getTerritoriesFromContract(contractVersion: ContractVersion): string[] {
    // Get all the rights from the contract titles.
    const rights = Object.values(contractVersion.titles).map(({ distributionRightIds }) =>
      this.getEntity(distributionRightIds)
    );
    // Returns all rights eligible territories as an array of string.
    return rights.map(right => right ? getRightTerritories(right) : []).flat();
  }
}
