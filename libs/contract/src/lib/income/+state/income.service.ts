import { Injectable } from '@angular/core';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
import { Income } from './income.model';

@Injectable({ providedIn: 'root' })
export class IncomeService extends BlockframesCollection<Income> {
  readonly path = 'incomes';
}
