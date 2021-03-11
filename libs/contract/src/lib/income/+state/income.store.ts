import { Injectable } from '@angular/core';
import { Income } from './income.model';
import { EntityState, ActiveState, EntityStore, StoreConfig } from '@datorama/akita';

export interface IncomeState extends EntityState<Income>, ActiveState<string> { }

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'incomes' })
export class IncomeStore extends EntityStore<IncomeState> {

  constructor() {
    super();
  }

}

