import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { ContractVersionState, ContractVersionStore } from './contract-version.store';

@Injectable({ providedIn: 'root' })
export class ContractVersionQuery extends QueryEntity<ContractVersionState> {

  constructor(protected store: ContractVersionStore) {
    super(store);
  }

}
