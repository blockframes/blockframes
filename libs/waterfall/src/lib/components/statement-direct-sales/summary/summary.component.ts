import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import {
  BreakdownRow,
  RightOverride,
  Statement,
  canOnlyReadStatements,
  filterStatements,
  generatePayments,
  getAssociatedRights,
  getRightsBreakdown,
  getSourcesBreakdown,
  getStatementRights,
  getStatementSources,
  sortStatements
} from '@blockframes/model';
import { unique } from '@blockframes/utils/helpers';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../form/statement.form';
import { combineLatest, map, shareReplay, switchMap, tap } from 'rxjs';
import { StatementService } from '../../../statement.service';
import { StatementArbitraryChangeComponent } from '../../statement-arbitrary-change/statement-arbitrary-change.component';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'waterfall-statement-direct-sales-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementDirectSalesSummaryComponent {

  @Input() form: StatementForm;
  @Input() public statement: Statement;
  private readonly = canOnlyReadStatements(this.shell.currentRightholder, this.shell.canBypassRules);
  
  public sources$ = combineLatest([this.shell.incomes$, this.shell.rights$, this.shell.simulation$]).pipe(
    map(([incomes, rights, simulation]) => getStatementSources(this.statement, this.waterfall.sources, incomes, rights, simulation.waterfall.state)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private statement$ = combineLatest([
    this.sources$, this.shell.incomes$, this.shell.expenses$,
    this.shell.rights$, this.shell.simulation$
  ]).pipe(
    switchMap(async ([sources, _incomes, _expenses, _rights, simulation]) => {
      const incomes = this.statement.incomeIds.map(id => _incomes.find(i => i.id === id));
      const expenses = this.statement.expenseIds.map(id => _expenses.find(e => e.id === id));

      if (this.statement.status === 'reported') {
        const incomes = _incomes.filter(i => this.statement.incomeIds.includes(i.id));
        this.form.setAllValue({ ...this.statement, incomes, expenses, sources });
        return this.statement;
      }

      // Refresh waterfall if some incomes or expenses are not in the simulated waterfall
      const missingIncomeIds = this.statement.incomeIds.filter(i => !simulation.waterfall.state.incomes[i]);
      const missingExpenseIds = this.statement.expenseIds.filter(i => !simulation.waterfall.state.expenses[i]);
      if (missingIncomeIds.length || missingExpenseIds.length) {

        const missingIncomes = incomes.filter(i => missingIncomeIds.includes(i.id));
        const missingExpenses = expenses.filter(e => missingExpenseIds.includes(e.id));

        await this.shell.appendToSimulation({
          incomes: missingIncomes.map(i => ({ ...i, status: 'received' })),
          expenses: missingExpenses.map(e => ({ ...e, status: 'received' })),
        });

        // Observable will re-emit with the new simulation
        return;
      }

      const statementRights = getStatementRights(this.statement, _rights);
      const rightIds = unique(sources.map(s => getAssociatedRights(s.id, statementRights, simulation.waterfall.state)).flat().map(r => r.id));
      const rights = statementRights.filter(r => rightIds.includes(r.id));

      if (this.statement.status === 'draft') {
        // Reset payments
        this.statement.payments.income = [];
        this.statement.payments.right = [];
      }

      const statement = generatePayments(this.statement, simulation.waterfall.state, rights, incomes);
      this.form.setAllValue({ ...this.statement, incomes, expenses, sources });
      return statement;
    }),
  );

  private statementsHistory$ = this.shell.statements$.pipe(
    map((statements) => filterStatements(this.statement.type, [this.statement.senderId, this.statement.receiverId], this.statement.contractId, statements)),
    map(statements => sortStatements(statements))
  );

  public sourcesBreakdown$ = combineLatest([
    this.sources$, this.statement$, this.shell.incomes$, this.shell.expenses$,
    this.statementsHistory$, this.shell.rights$, this.shell.simulation$
  ]).pipe(
    map(([sources, current, incomes, expenses, history, rights, simulation]) => {
      if (current.status === 'reported' && current.reportedData.sourcesBreakdown) return current.reportedData.sourcesBreakdown;
      try {
        return getSourcesBreakdown(
          this.shell.versionId$.value,
          this.shell.waterfall,
          sources,
          current,
          incomes,
          expenses,
          history,
          rights,
          simulation.waterfall.state
        );
      } catch (error) {
        if (error.message) this.snackbar.open(error.message, 'close', { duration: 5000 });
        console.log(error);
        return [];
      }
    }),
    tap(async sourcesBreakdown => {
      if(this.readonly) return;
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.sourcesBreakdown) {
        this.statement.reportedData.sourcesBreakdown = sourcesBreakdown;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.sourcesBreakdown) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public totalNetReceipt$ = this.sourcesBreakdown$.pipe(
    map(sources => sources.map(s => s.net).reduce((acc, curr) => {
      for (const currency of Object.keys(curr)) {
        acc[currency] = (acc[currency] || 0) + curr[currency];
      }
      return acc;
    }, {}))
  );

  public rightsBreakdown$ = combineLatest([
    this.statement$, this.statementsHistory$, this.shell.expenses$,
    this.shell.incomes$, this.shell.rights$, this.shell.simulation$
  ]).pipe(
    map(([current, history, expenses, incomes, rights, simulation]) => {
      if (current.status === 'reported' && current.reportedData.rightsBreakdown) return current.reportedData.rightsBreakdown;
      try {
        return getRightsBreakdown(
          this.shell.waterfall,
          current,
          incomes,
          expenses,
          history,
          rights,
          simulation.waterfall.state
        );
      } catch (error) {
        if (error.message) this.snackbar.open(error.message, 'close', { duration: 5000 });
        console.log(error);
        return [];
      }
    }),
    tap(async rightsBreakdown => {
      if(this.readonly) return;
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.rightsBreakdown) {
        this.statement.reportedData.rightsBreakdown = rightsBreakdown;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.rightsBreakdown) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public expenses$ = combineLatest([this.statement$, this.shell.expenses$]).pipe(
    map(([statement, expenses]) =>
      statement.expenseIds.map(id => expenses.find(e => e.id === id))
        .filter(e => statement.status === 'reported' ? !e.version[statement.versionId]?.hidden : true)
    ),
    tap(async expenses => {
      if(this.readonly) return;
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.expenses) {
        this.statement.reportedData.expenses = expenses;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.expenses) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public waterfall = this.shell.waterfall;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private statementService: StatementService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
  ) { }

  public canEditRightPayment(row: BreakdownRow, statement: Statement) {
    if (statement.status === 'reported') return false;
    if (row.maxPerIncome.every(i => i.max === 0)) return false;
    const incomeIds = row.maxPerIncome.map(i => i.income.id);
    if (statement.rightOverrides.find(c => c.rightId !== row.right.id && incomeIds.includes(c.incomeId))) return false;
    return true;
  }

  public editRightPayment(row: BreakdownRow, statement: Statement) {
    this.dialog.open(StatementArbitraryChangeComponent, {
      data: createModalData({
        right: row.right,
        maxPerIncome: row.maxPerIncome,
        overrides: statement.rightOverrides.filter(c => c.rightId === row.right.id),
        onConfirm: async (overrides: RightOverride[]) => {
          const rightOverrides = statement.rightOverrides.filter(c => c.rightId !== row.right.id);
          await this.statementService.update(statement.id, { rightOverrides: [...rightOverrides, ...overrides] }, { params: { waterfallId: this.waterfall.id } });

          // Refresh simulation
          await this.shell.simulateWaterfall();
        }
      })
    });
  }

  public hasOverrides(row: BreakdownRow, statement: Statement) {
    return statement.status === 'reported' && statement.rightOverrides.some(c => c.rightId === row.right.id);
  }

  public showOverrides(row: BreakdownRow, statement: Statement) {
    this.dialog.open(StatementArbitraryChangeComponent, {
      data: createModalData({
        mode: 'view',
        right: row.right,
        maxPerIncome: row.maxPerIncome,
        overrides: statement.rightOverrides.filter(c => c.rightId === row.right.id),
      })
    });
  }

}