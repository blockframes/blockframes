import { Injectable } from '@angular/core';
import { ContractStore, ContractState } from './contract.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Contract } from './contract.model';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'contracts' })
export class ContractService extends CollectionService<ContractState> {

  constructor(store: ContractStore) {
    super(store);
  }

  /**
   * @param contract
   */
  public async addContract(contract: Contract): Promise<string> {
    if (!contract.id) {
      contract.id = this.db.createId();
    }

    this.add(contract);
    return contract.id;
  }
}
