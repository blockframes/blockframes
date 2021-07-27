import { Injectable } from '@angular/core';
import { Mandate, Sale } from './contract.model';
import { EntityState, ActiveState, EntityStore, StoreConfig } from '@datorama/akita';

export interface ContractState extends EntityState<Sale | Mandate>, ActiveState<string> { }

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'contracts' })
export class ContractStore extends EntityStore<ContractState> {

  constructor() {
    super();
  }

}

