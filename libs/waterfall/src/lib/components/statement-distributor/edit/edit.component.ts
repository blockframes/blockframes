import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Statement, Territory, WaterfallSource, createMissingIncomes, getStatementSources } from '@blockframes/model';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../form/statement.form';
import { combineLatest, map, shareReplay } from 'rxjs';

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

        const missingIncomes = createMissingIncomes(sources, incomes, this.statement, this.shell.waterfall);
        this.form.setAllValue({ ...this.statement, incomes: [...incomes, ...missingIncomes], expenses, sources });
      }
      return this.statement;
    })
  );

  public incomeColumns = incomeColumns;
  public expenseColumns = expenseColumns;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dialog: MatDialog
  ) { }

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