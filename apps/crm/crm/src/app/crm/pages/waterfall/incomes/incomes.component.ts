import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IncomeService } from '@blockframes/contract/income/service';
import {
  Income,
  PricePerCurrency,
  WaterfallContract,
  getAssociatedSource,
  getContractAndAmendments,
  getCurrentContract,
} from '@blockframes/model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomesComponent implements OnInit {
  public incomes$ = this.shell.incomes$;
  private contracts: WaterfallContract[] = [];

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private incomeService: IncomeService,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.contracts = await firstValueFrom(this.shell.contracts$);
  }

  public getAssociatedSource(income: Income) {
    try {
      return getAssociatedSource(income, this.shell.waterfall.sources).name;
    } catch (error) {
      if (this.snackBar._openedSnackBarRef === null) this.snackBar.open(error, 'close', { duration: 5000 });
    }
  }

  public getCurrentContract(item: { contractId: string, date: Date }) {
    const contracts = getContractAndAmendments(item.contractId, this.contracts);
    const current = getCurrentContract(contracts, item.date);
    if (!current) return '--';
    return current.rootId ? `${current.id} (${current.rootId})` : current.id;
  }

  public toPricePerCurrency(item: Income): PricePerCurrency {
    return { [item.currency]: item.price };
  }

  public async removeIncomes(incomes: Income[]) {
    const promises = incomes.map(income => this.incomeService.remove(income.id));
    await Promise.all(promises);
    this.snackBar.open(`Income${incomes.length > 1 ? 's' : ''} ${incomes.length === 1 ? incomes[0].id : ''} deleted from waterfall !`, 'close', { duration: 5000 });
  }

}