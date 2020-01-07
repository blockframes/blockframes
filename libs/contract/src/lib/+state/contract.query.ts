import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { ContractStore, ContractState } from './contract.store';

@Injectable({ providedIn: 'root' })
export class ContractQuery extends QueryEntity<ContractState> {

  constructor(protected store: ContractStore) {
    super(store);
  }

}
