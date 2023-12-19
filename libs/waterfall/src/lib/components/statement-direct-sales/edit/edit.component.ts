import { Component, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Right,
  Statement,
  WaterfallSource,
  createMissingIncomes,
  getStatementSources,
  hasRightsWithExpenseCondition,
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../form/statement.form';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

@Component({
  selector: 'waterfall-statement-direct-sales-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementDirectSalesEditComponent implements OnChanges {

  @Input() private statement: Statement;
  @Input() form: StatementForm;

  public sourcesControl = new FormControl<string[]>([]);
  public sources$ = new BehaviorSubject<WaterfallSource[]>([]);
  public rights$ = this.shell.rights$;

  public statement$ = combineLatest([this.sources$, this.shell.incomes$, this.shell.expenses$, this.shell.waterfall$]).pipe(
    map(([sources, _incomes, _expenses, waterfall]) => {
      const incomes = this.statement.incomeIds.map(id => _incomes.find(i => i.id === id));
      const expenses = this.statement.expenseIds.map(id => _expenses.find(e => e.id === id));

      const expenseTypes = waterfall.expenseTypes.directSales || [];
      const missingIncomes = createMissingIncomes(sources, incomes, this.statement, this.shell.waterfall);

      if (this.form.pristine) {
        this.form.setAllValue({ ...this.statement, incomes: [...incomes, ...missingIncomes], expenses, sources, expenseTypes });
      } else if (missingIncomes.length) {
        this.form.addIncomes(missingIncomes, this.shell.waterfall.sources);
      }
      return this.statement;
    })
  );

  public waterfallSources: (WaterfallSource & { disabled?: boolean })[] = [];

  constructor(private shell: DashboardWaterfallShellComponent) { }

  async ngOnChanges() {
    const incomes = await this.shell.incomes();
    const sources = getStatementSources(this.statement, this.shell.waterfall.sources, incomes);
    this.waterfallSources = this.shell.waterfall.sources.map(s => sources.find(source => source.id === s.id) ? { ...s, disabled: true } : s);
    this.sourcesControl.setValue(sources.map(s => s.id));
    this.sources$.next(sources);
  }

  public declare() {
    const previous = this.sources$.value;
    const ids = this.sourcesControl.value;
    const sources = ids.map(id => this.shell.waterfall.sources.find(s => s.id === id));
    const removedSources = previous.filter(s => !sources.find(source => source.id === s.id));
    for (const source of removedSources) {
      this.form.removeSource(source.id);
    }
    this.sources$.next(sources);
  }

  public displayExpensesTab(_rights: Right[]) {
    return hasRightsWithExpenseCondition(_rights || [], this.statement, this.shell.waterfall);
  }

}