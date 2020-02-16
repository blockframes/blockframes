import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { ContractStore, ContractState } from './contract.store';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ContractQuery extends QueryEntity<ContractState> {

  // @todo(#1887) don't look for the last version
  public activeVersion$ = this.selectActive().pipe(
    map(contract => contract.versions[contract.versions.length - 1])
  );


  constructor(protected store: ContractStore) {
    super(store);
  }

}
