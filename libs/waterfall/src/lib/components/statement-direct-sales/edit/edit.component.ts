import { Component, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Income, Statement, Territory, WaterfallSource, createMissingIncomes, getStatementSources } from '@blockframes/model';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../form/statement.form';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

const incomeColumns = {
  medias: 'Medias',
  territories: 'Territories',
  '': 'Price',
}

const expenseColumns = {
  type: 'Type',
  category: 'Category',
  '': 'Price',
}

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

  public statement$ = combineLatest([this.sources$, this.shell.incomes$, this.shell.expenses$]).pipe(
    map(([sources, _incomes, _expenses]) => {
      const incomes = this.statement.incomeIds.map(id => _incomes.find(i => i.id === id));
      const expenses = this.statement.expenseIds.map(id => _expenses.find(i => i.id === id));

      const missingIncomes = createMissingIncomes(sources, incomes, this.statement, this.shell.waterfall);

      if (this.form.pristine) {
        this.form.setAllValue({ ...this.statement, incomes: [...incomes, ...missingIncomes], expenses, sources });
      } else if (missingIncomes.length) {
        this.form.addIncomes(missingIncomes, this.shell.waterfall.sources);
      }

      return this.statement;
    })
  );

  public incomeColumns = incomeColumns;
  public expenseColumns = expenseColumns;

  public waterfallSources: (WaterfallSource & { disabled?: boolean })[] = [];
  private incomes: Income[] = [];

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dialog: MatDialog
  ) { }

  async ngOnChanges() {
    this.incomes = await this.shell.incomes();
    const sources = getStatementSources(this.statement, this.shell.waterfall.sources, this.incomes);
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
      this.form.removeControl(source.id);
    }
    this.sources$.next(sources);
  }

  public openTerritoryModal(territories: Territory[]) {
    this.dialog.open(DetailedGroupComponent, {
      data: createModalData({ items: territories, scope: 'territories' }),
      autoFocus: false
    });
  }

  public defaultIncomeValue(source: WaterfallSource) {
    return { medias: source.medias, territories: source.territories };
  }

  public defaultExpenseValue() {
    return { type: 'type', category: 'category' };
  }

}