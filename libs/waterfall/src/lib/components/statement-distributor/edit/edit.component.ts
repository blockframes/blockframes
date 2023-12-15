import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Statement, createMissingIncomes, getStatementSources } from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../form/statement.form';
import { combineLatest, map, shareReplay } from 'rxjs';

@Component({
  selector: 'waterfall-statement-distributor-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementDistributorEditComponent {

  @Input() private statement: Statement;
  @Input() form: StatementForm;

  public sources$ = combineLatest([this.shell.incomes$, this.shell.rights$, this.shell.simulation$]).pipe(
    map(([incomes, rights, simulation]) => getStatementSources(this.statement, this.shell.waterfall.sources, incomes, rights, simulation.waterfall.state)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public statement$ = combineLatest([this.sources$, this.shell.incomes$, this.shell.expenses$]).pipe(
    map(([sources, _incomes, _expenses]) => {
      if (this.form.pristine) {
        const incomes = this.statement.incomeIds.map(id => _incomes.find(i => i.id === id));
        const expenses = this.statement.expenseIds.map(id => _expenses.find(i => i.id === id));

        const expenseTypes = this.shell.waterfall.expenseTypes[this.statement.contractId] || [];
        const missingIncomes = createMissingIncomes(sources, incomes, this.statement, this.shell.waterfall);
        this.form.setAllValue({ ...this.statement, incomes: [...incomes, ...missingIncomes], expenses, sources, expenseTypes });
      }
      return this.statement;
    })
  );

  constructor(private shell: DashboardWaterfallShellComponent) { }

}