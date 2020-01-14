import { Injectable } from '@angular/core';
import { ContractWithLastVersion } from './contract.model';
import { EntityState, ActiveState, EntityStore, StoreConfig } from '@datorama/akita';

export interface ContractState extends EntityState<ContractWithLastVersion, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'contracts' })
export class ContractStore extends EntityStore<ContractState> {

  constructor() {
    super();
  }

}

