import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ExpenseService } from '@blockframes/contract/expense/service';
import { Expense } from '@blockframes/model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesComponent {
  public waterfall = this.shell.waterfall;
  public expenses$ = this.shell.expenses$;
  public contracts$ = this.shell.contracts$;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private expenseService: ExpenseService,
    private snackBar: MatSnackBar
  ) { }

  public async removeExpenses(expenses: Expense[]) {
    const promises = expenses.map(expense => this.expenseService.remove(expense.id));
    await Promise.all(promises);
    this.snackBar.open(`Expense${expenses.length > 1 ? 's' : ''} ${expenses.length === 1 ? expenses[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
  }

}