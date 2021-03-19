import { Injectable } from '@angular/core';
import { ContractStore, ContractState } from './contract.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { centralOrgID } from '@env';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts' })
export class ContractService extends CollectionService<ContractState> {

  constructor(store: ContractStore) {
    super(store);
  }

  getContractsOfOrg(orgId = centralOrgID) {
    // Only the mandate of Archipel Content && only sales which match the contract of Archipel Content
    return Promise.all([
      this.getValue(ref => ref.where('type', '==', 'mandata').where('buyerId', '==', orgId)),
      this.getValue(ref => ref.where('type', '==', 'sale').where('sellerId', '==', orgId))
    ]).then(([mandates, sales]) => [...mandates, ...sales]);
  }
}
