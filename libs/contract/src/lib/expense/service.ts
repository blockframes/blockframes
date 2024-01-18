import { Injectable } from '@angular/core';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
import { Expense, Statement, convertExpensesTo } from '@blockframes/model';
import { where } from 'firebase/firestore';
import { map } from 'rxjs';

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
