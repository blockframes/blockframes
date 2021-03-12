import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { IncomeStore, IncomeState } from './income.store';

@Injectable({ providedIn: 'root' })
export class IncomeQuery extends QueryEntity<IncomeState> {

  constructor(protected store: IncomeStore) {
    super(store);
  }
}
