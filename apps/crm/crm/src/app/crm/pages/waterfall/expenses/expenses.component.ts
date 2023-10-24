import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ExpenseService } from '@blockframes/contract/expense/service';
import {
  Expense,
  PricePerCurrency,
  WaterfallContract,
  getContractAndAmendments,
  getCurrentContract,
} from '@blockframes/model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesComponent implements OnInit {

  public expenses$ = this.shell.expenses$;
  private contracts: WaterfallContract[] = [];

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private expenseService: ExpenseService,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.contracts = await firstValueFrom(this.shell.contracts$);
  }

  public getRightholderName(id: string) {
    if (!id) return '--';
    return this.shell.waterfall.rightholders.find(r => r.id === id)?.name || '--';
  }

  public getCurrentContract(item: { contractId: string, date: Date }) {
    const contracts = getContractAndAmendments(item.contractId, this.contracts);
    const current = getCurrentContract(contracts, item.date);
    if (!current) return '--';
    return current.rootId ? `${current.id} (${current.rootId})` : current.id;
  }

  public toPricePerCurrency(item:  Expense): PricePerCurrency {
    return { [item.currency]: item.price };
  }

  public async removeExpenses(expenses: Expense[]) {
    const promises = expenses.map(expense => this.expenseService.remove(expense.id));
    await Promise.all(promises);
    this.snackBar.open(`Expense${expenses.length > 1 ? 's' : ''} ${expenses.length === 1 ? expenses[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
  }

}