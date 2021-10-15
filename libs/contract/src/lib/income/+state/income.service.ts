import { Injectable } from '@angular/core';
import { IncomeStore, IncomeState } from './income.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'incomes' })
export class IncomeService extends CollectionService<IncomeState> {
  useMemorization = true;
  constructor(store: IncomeStore) {
    super(store);
  }
}
