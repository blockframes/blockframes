import { Injectable } from '@angular/core';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
import { Expense, Statement } from '@blockframes/model';
import { where } from 'firebase/firestore';
import { map } from 'rxjs';

function convertExpensesTo(expenses: Expense[], versionId: string, statements: Statement[]) {
  if (!versionId) return expenses;
  return expenses.map(e => {
    const price = (e.version && e.version[versionId] !== undefined) ? e.version[versionId].price : e.price;
    return { ...e, price };
  }).filter(e => statements.find(s => s.expenseIds?.includes(e.id)));
}

@Injectable({ providedIn: 'root' })
export class ExpenseService extends BlockframesCollection<Expense> {
  readonly path = 'expenses';

  public expensesChanges(waterfallId: string, statements: Statement[], versionId: string) {
    return this.valueChanges([where('titleId', '==', waterfallId)]).pipe(
      map(expenses => convertExpensesTo(expenses, versionId, statements))
    );
  }

  public async expenses(waterfallId: string, statements: Statement[], ids: string[], versionId?: string) {
    const expenses = Array.isArray(ids) ? await this.getValue(ids) : await this.getValue([where('titleId', '==', waterfallId)]);
    return convertExpensesTo(expenses, versionId, statements);
  }
}
