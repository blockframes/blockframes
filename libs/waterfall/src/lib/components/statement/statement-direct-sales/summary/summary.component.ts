import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import {
  BreakdownRow,
  RightOverride,
  RightType,
  Statement,
  canOnlyReadStatements,
  filterStatements,
  generatePayments,
  getAssociatedRights,
  getDistributorExpensesDetails,
  getExpensesHistory,
  getRightsBreakdown,
  getSourcesBreakdown,
  getStatementRights,
  getStatementSources,
  preferredLanguage,
  skipSourcesWithAllHiddenIncomes,
  sortStatements,
  sum
} from '@blockframes/model';
import { unique } from '@blockframes/utils/helpers';
import { DashboardWaterfallShellComponent } from '../../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../../form/statement.form';
import { Observable, combineLatest, map, shareReplay, switchMap, tap } from 'rxjs';
import { StatementService } from '../../../../statement.service';
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
  private devMode = false;
  private lang = preferredLanguage();

  private sources$ = combineLatest([this.shell.incomes$, this.shell.rights$, this.shell.simulation$]).pipe(
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
        this.form.setAllValue({
          ...this.statement,
          incomes: _incomes.filter(i => this.statement.incomeIds.includes(i.id)),
          expenses,
          sources
        });
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

  public cleanSources$ = combineLatest([this.statement$, this.sources$, this.shell.incomes$]).pipe(
    map(([statement, sources, incomes]) => skipSourcesWithAllHiddenIncomes(statement, sources, incomes)),
  );

  public sourcesBreakdown$ = combineLatest([
    this.sources$, this.statement$, this.shell.incomes$, this.shell.expenses$,
    this.statementsHistory$, this.shell.rights$, this.shell.simulation$
  ]).pipe(
    map(([declaredSources, current, incomes, expenses, history, rights, simulation]) => {
      if (!this.devMode && current.status === 'reported' && current.reportedData.sourcesBreakdown) return current.reportedData.sourcesBreakdown;
      try {
        // On direct sales statements, only display commission and expenses rights
        // This is needed to show only theses kind of rights since directSales statements does not have a contract Id.
        const displayedRightTypes: RightType[] = ['commission', 'expenses'];
        return getSourcesBreakdown(
          this.shell.waterfall,
          declaredSources,
          current,
          incomes,
          expenses,
          history,
          rights,
          simulation.waterfall.state,
          this.lang,
          displayedRightTypes
        );
      } catch (error) {
        if (error.message) this.snackbar.open(error.message, 'close', { duration: 5000 });
        console.log(error);
        return [];
      }
    }),
    tap(async sourcesBreakdown => {
      if (this.readonly || (this.statement.versionId !== this.shell.versionId$.value)) return;
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.sourcesBreakdown) {
        this.statement.reportedData.sourcesBreakdown = sourcesBreakdown;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.sourcesBreakdown) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public totalNetReceipt$: Observable<number> = this.sourcesBreakdown$.pipe(map(sources => sum(sources, s => s.net)));

  public rightsBreakdown$ = combineLatest([
    this.statement$, this.statementsHistory$, this.shell.expenses$,
    this.shell.incomes$, this.shell.rights$, this.shell.simulation$, this.sources$
  ]).pipe(
    map(([current, history, expenses, incomes, rights, simulation, declaredSources]) => {
      if (!this.devMode && current.status === 'reported' && current.reportedData.rightsBreakdown) return current.reportedData.rightsBreakdown;
      try {
        // On direct sales statements, only display commission and expenses rights
        // This is needed to show only theses kind of rights since directSales statements does not have a contract Id.
        const displayedRightTypes: RightType[] = ['commission', 'expenses'];
        return getRightsBreakdown(
          this.shell.waterfall,
          current,
          incomes,
          expenses,
          history,
          rights,
          simulation.waterfall.state,
          declaredSources,
          this.lang,
          displayedRightTypes
        );
      } catch (error) {
        if (error.message) this.snackbar.open(error.message, 'close', { duration: 5000 });
        console.log(error);
        return [];
      }
    }),
    tap(async rightsBreakdown => {
      if (this.readonly || (this.statement.versionId !== this.shell.versionId$.value)) return;
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.rightsBreakdown) {
        this.statement.reportedData.rightsBreakdown = rightsBreakdown;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.rightsBreakdown) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  /**
   * This calculus is directSales specific since there is no rightholder payment in the statement
   * (direstSales statements are from producer to producer)
   * @dev This code takes totalNetReceipt and substitute price from commission and expenses from rightsBreakdown
   * to get the amount that the producer (from distributor point of view) will send to producer.
   */
  public producerNetParticipation$: Observable<number> = combineLatest([this.statement$, this.totalNetReceipt$, this.rightsBreakdown$]).pipe(
    map(([current, totalNetReceipt, rightsBreakdown]) => {
      if (!this.devMode && current.status === 'reported' && current.reportedData.producerNetParticipation) return current.reportedData.producerNetParticipation;
      const rightsTaken = sum(rightsBreakdown, rb =>  rb.total);
      const total = totalNetReceipt - rightsTaken;
      return total;
    }),
    tap(async producerNetParticipation => {
      if (this.readonly || (this.statement.versionId !== this.shell.versionId$.value)) return;
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.producerNetParticipation) {
        this.statement.reportedData.producerNetParticipation = producerNetParticipation;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.expenses) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public expensesHistory$ = combineLatest([
    this.statement$, this.statementsHistory$, this.shell.expenses$,
    this.sources$, this.shell.rights$, this.shell.simulation$, this.shell.incomes$
  ]).pipe(
    map(([current, history, expenses, declaredSources, rights, simulation, incomes]) => {
      if (!this.devMode && current.status === 'reported' && current.reportedData.expenses) return current.reportedData.expenses;
      return getExpensesHistory(current, history, expenses, declaredSources, rights, simulation.waterfall.state, incomes);
    }),
    tap(async expensesHistory => {
      if (this.readonly || (this.statement.versionId !== this.shell.versionId$.value)) return;
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.expenses) {
        this.statement.reportedData.expenses = expensesHistory;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.expenses) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public expensesDetails$ = combineLatest([this.statement$, this.expensesHistory$]).pipe(
    map(([current, history]) => {
      if (!this.devMode && current.status === 'reported' && current.reportedData.distributorExpenses) return current.reportedData.distributorExpenses;
      return getDistributorExpensesDetails([current], history, this.shell.waterfall);
    }),
    tap(async expensesDetails => {
      if (this.readonly || (this.statement.versionId !== this.shell.versionId$.value)) return;
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.distributorExpenses) {
        this.statement.reportedData.distributorExpenses = expensesDetails;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.distributorExpenses) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public waterfall = this.shell.waterfall;
  public i18nStrings = { yes: $localize`Yes`, no: $localize`No` };

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
          this.snackbar.open('changes applied', 'close', { duration: 5000 });
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