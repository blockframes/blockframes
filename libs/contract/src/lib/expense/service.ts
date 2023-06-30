import { Injectable } from '@angular/core';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
import { Expense } from '@blockframes/model';

@Injectable({ providedIn: 'root' })
export class ExpenseService extends BlockframesCollection<Expense> {
  readonly path = 'expenses';
}
