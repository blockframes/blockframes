import { Injectable } from '@angular/core';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
import { Expense } from '@blockframes/model';
import { where } from 'firebase/firestore';
import { map } from 'rxjs';

function convertExpensesTo(expenses: Expense[], versionId: string) {
  if (!versionId) return expenses;
  return expenses.map(e => {
    const price = (e.version && e.version[versionId] !== undefined) ? e.version[versionId].price : e.price;
    return { ...e, price };
  });
}

@Injectable({ providedIn: 'root' })
export class ExpenseService extends BlockframesCollection<Expense> {
  readonly path = 'expenses';

  public expensesChanges(waterfallId: string, versionId: string) {
    return this.valueChanges([where('titleId', '==', waterfallId)]).pipe(
      map(expenses => convertExpensesTo(expenses, versionId))
    );
  }

  public async expenses(waterfallId: string, ids: string[] = [], versionId?: string) {
    const expenses = ids.length ? await this.getValue(ids) : await this.getValue([where('titleId', '==', waterfallId)]);
    return convertExpensesTo(expenses, versionId);
  }
}
