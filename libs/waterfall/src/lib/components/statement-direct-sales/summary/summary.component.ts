import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import {
  MovieCurrency,
  PricePerCurrency,
  Right,
  RightOverride,
  RightPayment,
  Statement,
  filterStatements,
  generatePayments,
  getAssociatedRights,
  getCalculatedAmount,
  getIncomingAmount,
  getOrderedRights,
  getRightExpenseTypes,
  getSources,
  getStatementRights,
  getStatementRightsToDisplay,
  getStatementSources,
  getTotalPerCurrency,
  sortStatements,
  toLabel
} from '@blockframes/model';
import { unique } from '@blockframes/utils/helpers';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../form/statement.form';
import { combineLatest, map, shareReplay, switchMap } from 'rxjs';
import { StatementService } from '../../../statement.service';
import { MaxPerIncome, StatementArbitraryChangeComponent } from '../../statement-arbitrary-change/statement-arbitrary-change.component';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';

interface BreakdownRow {
  section: string;
  type?: 'right' | 'net' | 'expense';
  previous: PricePerCurrency;
  current: PricePerCurrency;
  cumulated: PricePerCurrency;
  right?: Right;
  cap?: PricePerCurrency;
  maxPerIncome?: MaxPerIncome[];
}

@Component({
  selector: 'waterfall-statement-direct-sales-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementDirectSalesSummaryComponent {

  @Input() form: StatementForm;
  @Input() public statement: Statement;

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
    map(([sources, current, incomes, _expenses, _history, rights, simulation]) => {
      const indexOfCurrent = _history.findIndex(s => s.id === current.id || s.id === current.duplicatedFrom);
      _history[indexOfCurrent] = { ...current, number: _history[indexOfCurrent].number };
      const previous = _history.slice(indexOfCurrent + 1);
      const history = _history.slice(indexOfCurrent);

      const displayedRights = getStatementRightsToDisplay(current, rights);
      const orderedRights = getOrderedRights(displayedRights, simulation.waterfall.state);
      const statementIncomes = incomes.filter(i => this.statement.incomeIds.includes(i.id));

      return sources.map(source => {
        const rows: BreakdownRow[] = [];

        // Remove sources where all incomes are hidden from reported statement 
        if (this.statement.status === 'reported') {
          const sourceIncomes = statementIncomes.filter(i => i.sourceId === source.id);
          const allHidden = sourceIncomes.every(i => i.version[this.shell.versionId$.value]?.hidden);
          if (allHidden) return;
        }

        // Incomes declared by statement.senderId
        const previousSourcePayments = previous.map(s => s.payments.income).flat().filter(income => incomes.find(i => i.id === income.incomeId).sourceId === source.id);
        const currentSourcePayments = current.payments.income.filter(income => incomes.find(i => i.id === income.incomeId).sourceId === source.id);
        const cumulatedSourcePayments = history.map(s => s.payments.income).flat().filter(income => incomes.find(i => i.id === income.incomeId).sourceId === source.id);
        rows.push({
          section: 'Gross Receipts',
          previous: getTotalPerCurrency(previousSourcePayments),
          current: getTotalPerCurrency(currentSourcePayments),
          cumulated: getTotalPerCurrency(cumulatedSourcePayments)
        });

        const rights = orderedRights.filter(right => {
          const rightSources = getSources(simulation.waterfall.state, right.id);
          return rightSources.length === 1 && rightSources[0].id === source.id;
        });

        // What senderId took from source to pay his rights
        const previousSum: RightPayment[] = [];
        const currentSum: RightPayment[] = [];
        const cumulatedSum: RightPayment[] = [];
        const stillToBeRecouped: { price: number, currency: MovieCurrency }[] = [];
        for (const right of rights) {
          const section = right.type ? `${right.name} (${toLabel(right.type, 'rightTypes')} - ${right.percent}%)` : `${right.name} (${right.percent}%)`;
          const previousRightPayment = previous.map(s => s.payments.right).flat().filter(p => p.to === right.id);
          previousSum.push(...previousRightPayment.map(r => ({ ...r, price: -r.price })));
          const currentRightPayment = current.payments.right.filter(p => p.to === right.id);
          currentSum.push(...currentRightPayment.map(r => ({ ...r, price: -r.price })));
          const cumulatedRightPayment = history.map(s => s.payments.right).flat().filter(p => p.to === right.id);
          cumulatedSum.push(...cumulatedRightPayment.map(r => ({ ...r, price: -r.price })));

          const rightExpenseTypes = getRightExpenseTypes(right, current, this.waterfall);
          for (const expenseTypeId of rightExpenseTypes) {
            const currentExpenses = _expenses.filter(e => e.typeId === expenseTypeId && current.expenseIds.includes(e.id));
            const previousExpenses = _expenses.filter(e => e.typeId === expenseTypeId && previous.map(s => s.expenseIds).flat().includes(e.id));
            const cumulatedExpenses = _expenses.filter(e => e.typeId === expenseTypeId && history.map(s => s.expenseIds).flat().includes(e.id));

            const expenseType = this.waterfall.expenseTypes.directSales?.find(e => e.id === expenseTypeId);
            if (!expenseType) this.snackbar.open(`Expense type id "${expenseTypeId}" used in conditions of "${right.name}" is not defined.`, 'close', { duration: 5000 });

            const cap = current.versionId && expenseType.cap.version[current.versionId] ? expenseType.cap.version[current.versionId] : expenseType.cap.default;

            rows.push({
              section: expenseType.name,
              cap: cap > 0 ? { [expenseType.currency]: cap } : undefined,
              type: 'expense',
              previous: getTotalPerCurrency(previousExpenses),
              current: getTotalPerCurrency(currentExpenses),
              cumulated: getTotalPerCurrency(cumulatedExpenses)
            });

            stillToBeRecouped.push(...cumulatedExpenses);
          }

          if (rightExpenseTypes.length > 0) stillToBeRecouped.push(...cumulatedRightPayment.map(r => ({ currency: r.currency, price: -r.price })));

          const maxPerIncome = unique(currentRightPayment.map(r => r.incomeIds).flat()).map(incomeId => ({
            income: incomes.find(i => i.id === incomeId),
            max: getIncomingAmount(right.id, incomeId, simulation.waterfall.state.transfers),
            current: getCalculatedAmount(right.id, incomeId, simulation.waterfall.state.transfers),
            source
          })).filter(i => i.max > 0);

          rows.push({
            section,
            type: 'right',
            right,
            previous: getTotalPerCurrency(previousRightPayment),
            current: getTotalPerCurrency(currentRightPayment),
            cumulated: getTotalPerCurrency(cumulatedRightPayment),
            maxPerIncome
          });
        }

        // Net receipts
        const currentNet = getTotalPerCurrency([...currentSourcePayments, ...currentSum]);
        rows.push({
          section: `${source.name} (Net Receipts)`,
          type: 'net',
          previous: getTotalPerCurrency([...previousSourcePayments, ...previousSum]),
          current: currentNet,
          cumulated: getTotalPerCurrency([...cumulatedSourcePayments, ...cumulatedSum])
        });

        return {
          name: source.name,
          rows,
          net: currentNet,
          stillToBeRecouped: stillToBeRecouped.length ? getTotalPerCurrency(stillToBeRecouped) : undefined
        };
      }).filter(r => r);
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
    map(([current, _history, _expenses, incomes, rights, simulation]) => {
      const indexOfCurrent = _history.findIndex(s => s.id === current.id || s.id === current.duplicatedFrom);
      _history[indexOfCurrent] = { ...current, number: _history[indexOfCurrent].number };
      const previous = _history.slice(indexOfCurrent + 1);
      const history = _history.slice(indexOfCurrent);

      const displayedRights = getStatementRightsToDisplay(current, rights);
      const orderedRights = getOrderedRights(displayedRights, simulation.waterfall.state);
      const rightsWithManySources = orderedRights.filter(right => getSources(simulation.waterfall.state, right.id).length > 1);

      const rightTypes = unique(rightsWithManySources.map(right => right.type));

      return rightTypes.map(type => {
        const rows: BreakdownRow[] = [];

        const stillToBeRecouped: { price: number, currency: MovieCurrency }[] = [];
        for (const right of rightsWithManySources) {
          if (right.type !== type) continue;

          const section = `${right.name} (${right.percent}%)`;
          const previousRightPayment = previous.map(s => s.payments.right).flat().filter(p => p.to === right.id);
          const currentRightPayment = current.payments.right.filter(p => p.to === right.id);
          const cumulatedRightPayment = history.map(s => s.payments.right).flat().filter(p => p.to === right.id);

          const rightExpenseTypes = getRightExpenseTypes(right, current, this.waterfall);
          for (const expenseTypeId of rightExpenseTypes) {
            const currentExpenses = _expenses.filter(e => e.typeId === expenseTypeId && current.expenseIds.includes(e.id));
            const previousExpenses = _expenses.filter(e => e.typeId === expenseTypeId && previous.map(s => s.expenseIds).flat().includes(e.id));
            const cumulatedExpenses = _expenses.filter(e => e.typeId === expenseTypeId && history.map(s => s.expenseIds).flat().includes(e.id));

            const expenseType = this.waterfall.expenseTypes.directSales?.find(e => e.id === expenseTypeId);
            if (!expenseType) this.snackbar.open(`Expense type id "${expenseTypeId}" used in conditions of "${right.name}" is not defined.`, 'close', { duration: 5000 });

            const cap = current.versionId && expenseType.cap.version[current.versionId] ? expenseType.cap.version[current.versionId] : expenseType.cap.default;

            rows.push({
              section: expenseType.name,
              cap: cap > 0 ? { [expenseType.currency]: cap } : undefined,
              type: 'expense',
              previous: getTotalPerCurrency(previousExpenses),
              current: getTotalPerCurrency(currentExpenses),
              cumulated: getTotalPerCurrency(cumulatedExpenses)
            });

            stillToBeRecouped.push(...cumulatedExpenses);
          }

          if (rightExpenseTypes.length > 0) stillToBeRecouped.push(...cumulatedRightPayment.map(r => ({ currency: r.currency, price: -r.price })));

          const maxPerIncome = unique(currentRightPayment.map(r => r.incomeIds).flat())
            .map(incomeId => incomes.find(i => i.id === incomeId))
            .map(income => ({
              income,
              max: getIncomingAmount(right.id, income.id, simulation.waterfall.state.transfers),
              current: getCalculatedAmount(right.id, income.id, simulation.waterfall.state.transfers),
              source: this.waterfall.sources.find(s => s.id === income.sourceId)
            })).filter(i => i.max > 0);

          rows.push({
            section,
            type: 'right',
            right,
            previous: getTotalPerCurrency(previousRightPayment),
            current: getTotalPerCurrency(currentRightPayment),
            cumulated: getTotalPerCurrency(cumulatedRightPayment),
            maxPerIncome
          });
        }

        const total = rows.filter(r => r.type === 'right').map(r => r.current).reduce((acc, curr) => {
          for (const currency of Object.keys(curr)) {
            acc[currency] = (acc[currency] || 0) + curr[currency];
          }
          return acc;
        }, {});

        return {
          name: toLabel(type, 'rightTypes'),
          rows,
          total,
          stillToBeRecouped: stillToBeRecouped.length ? getTotalPerCurrency(stillToBeRecouped) : undefined
        };
      });
    })
  );

  public expenses$ = combineLatest([this.statement$, this.shell.expenses$]).pipe(
    map(([statement, expenses]) =>
      statement.expenseIds.map(id => expenses.find(e => e.id === id))
        .filter(e => statement.status === 'reported' ? !e.version[statement.versionId]?.hidden : true)
    )
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