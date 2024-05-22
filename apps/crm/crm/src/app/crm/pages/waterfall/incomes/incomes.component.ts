import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IncomeService } from '@blockframes/contract/income/service';
import { Income, PricePerCurrency } from '@blockframes/model';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomesComponent {
  public incomes$ = this.shell.incomes$;
  public contracts$ = this.shell.contracts$;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private incomeService: IncomeService,
    private snackBar: MatSnackBar
  ) { }

  public getAssociatedSource(income: Income) {
    try {
      return this.shell.waterfall.sources.find(source => source.id === income.sourceId).name;
    } catch (error) {
      if (this.snackBar._openedSnackBarRef === null) this.snackBar.open(error, 'close', { duration: 5000 });
    }
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