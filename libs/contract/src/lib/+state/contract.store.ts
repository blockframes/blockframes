import { Injectable } from '@angular/core';
import { Contract } from './contract.model';
import { EntityState, ActiveState, EntityStore, StoreConfig } from '@datorama/akita';

export interface ContractState extends EntityState<Contract, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'contract' })
export class ContractStore extends EntityStore<ContractState> {

  constructor() {
    super();
  }

}

