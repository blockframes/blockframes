import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import {
  MovieCurrency,
  PricePerCurrency,
  RightPayment,
  Statement,
  createCompensation,
  filterStatements,
  generatePayments,
  getAssociatedRights,
  getAssociatedSource,
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
import { StatementService } from '@blockframes/waterfall/statement.service';

interface BreakdownRow { 
  section: string, 
  type?: 'right' | 'net' | 'expense', 
  previous: PricePerCurrency, 
  current: PricePerCurrency, 
  cumulated: PricePerCurrency, 
  rightId?: string, 
  cap?: PricePerCurrency
}

@Component({
  selector: 'waterfall-statement-distributor-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementDistributorSummaryComponent {

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

      // Refresh waterfall if some incomes or expenses are not in the simulated waterfall
      const missingIncomeIds = this.statement.incomeIds.filter(i => !simulation.waterfall.state.incomes[i]);
      const missingExpenseIds = this.statement.expenseIds.filter(i => !simulation.waterfall.state.expenses[i]);
      const missingCompensations = this.statement.compensations.filter(c => !simulation.waterfall.state.incomes[c.id]);
      if (missingIncomeIds.length || missingExpenseIds.length || missingCompensations.length) {

        const missingIncomes = incomes.filter(i => missingIncomeIds.includes(i.id));
        const missingExpenses = expenses.filter(e => missingExpenseIds.includes(e.id));

        await this.shell.appendToSimulation({
          incomes: [...missingIncomes, ...missingCompensations].map(i => ({ ...i, status: 'received' })),
          expenses: missingExpenses.map(e => ({ ...e, status: 'received' })),
        });

        // Observable will re-emit with the new simulation
        return;
      }

      const statementRights = getStatementRights(this.statement, _rights);
      const rightIds = unique(sources.map(s => getAssociatedRights(s.id, statementRights, simulation.waterfall.state)).flat().map(r => r.id));
      const rights = statementRights.filter(r => rightIds.includes(r.id));

      const statement = generatePayments(this.statement, simulation.waterfall.state, rights, incomes, sources);
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
      const indexOfCurrent = _history.findIndex(s => s.id === current.id);
      _history[indexOfCurrent] = { ...current, number: _history[indexOfCurrent].number };
      const previous = _history.slice(indexOfCurrent + 1);
      const history = _history.slice(indexOfCurrent);

      const displayedRights = getStatementRightsToDisplay(current, rights);
      const orderedRights = getOrderedRights(displayedRights, simulation.waterfall.state);

      return sources.map(source => {
        const rows: BreakdownRow[] = [];

        // Incomes declared by statement.senderId
        const previousSourcePayments = previous.map(s => s.payments.income).flat().filter(income => getAssociatedSource(incomes.find(i => i.id === income.incomeId), this.waterfall.sources).id === source.id);
        const currentSourcePayments = current.payments.income.filter(income => getAssociatedSource(incomes.find(i => i.id === income.incomeId), this.waterfall.sources).id === source.id);
        const cumulatedSourcePayments = history.map(s => s.payments.income).flat().filter(income => getAssociatedSource(incomes.find(i => i.id === income.incomeId), this.waterfall.sources).id === source.id);
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

            const expenseType = this.waterfall.expenseTypes[current.contractId].find(e => e.id === expenseTypeId);

            rows.push({
              section: expenseType.name,
              cap: expenseType.cap.default > 0 ? { [expenseType.currency]: expenseType.cap.default } : undefined, // TODO #9520 replace default by versionId
              type: 'expense',
              rightId: right.id,
              previous: getTotalPerCurrency(previousExpenses),
              current: getTotalPerCurrency(currentExpenses),
              cumulated: getTotalPerCurrency(cumulatedExpenses)
            });

            stillToBeRecouped.push(...cumulatedExpenses);
          }

          if (rightExpenseTypes.length > 0) stillToBeRecouped.push(...cumulatedRightPayment.map(r => ({ currency: r.currency, price: -r.price })));

          rows.push({
            section,
            type: 'right',
            rightId: right.id,
            previous: getTotalPerCurrency(previousRightPayment),
            current: getTotalPerCurrency(currentRightPayment),
            cumulated: getTotalPerCurrency(cumulatedRightPayment)
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
      });
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
    this.shell.rights$, this.shell.simulation$
  ]).pipe(
    map(([current, _history, _expenses, rights, simulation]) => {
      const indexOfCurrent = _history.findIndex(s => s.id === current.id);
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

            const expenseType = this.waterfall.expenseTypes[current.contractId].find(e => e.id === expenseTypeId);

            rows.push({
              section: expenseType.name,
              cap: expenseType.cap.default > 0 ? { [expenseType.currency]: expenseType.cap.default } : undefined, // TODO #9520 replace default by versionId
              type: 'expense',
              rightId: right.id,
              previous: getTotalPerCurrency(previousExpenses),
              current: getTotalPerCurrency(currentExpenses),
              cumulated: getTotalPerCurrency(cumulatedExpenses)
            });

            stillToBeRecouped.push(...cumulatedExpenses);
          }

          if (rightExpenseTypes.length > 0) stillToBeRecouped.push(...cumulatedRightPayment.map(r => ({ currency: r.currency, price: -r.price })));

          rows.push({
            section,
            type: 'right',
            rightId: right.id,
            previous: getTotalPerCurrency(previousRightPayment),
            current: getTotalPerCurrency(currentRightPayment),
            cumulated: getTotalPerCurrency(cumulatedRightPayment)
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

  private waterfall = this.shell.waterfall;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private statementService: StatementService
  ) { }


  public async editRightPayment(row: BreakdownRow, statement: Statement) {

    if(!statement.compensations.find(c => c.id === 'compensation')) {
      // TODO #9524 update form, regenerate payments, update simulation ...
      const compensation = createCompensation({ id: 'compensation', price: 1000, currency: 'EUR', date: statement.duration.to, to: row.rightId, from: 'playtime_com_cine'});

      await this.statementService.update(statement.id, { compensations: [compensation] }, { params: { waterfallId: this.waterfall.id } });
    } else {
      // tmp remove compensation
      await this.statementService.update(statement.id, { compensations: [] }, { params: { waterfallId: this.waterfall.id } });
    }
  }

}