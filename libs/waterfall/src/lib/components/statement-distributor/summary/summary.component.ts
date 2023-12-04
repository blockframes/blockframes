import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import {
  PricePerCurrency,
  RightPayment,
  Statement,
  filterStatements,
  generatePayments,
  getAssociatedRights,
  getAssociatedSource,
  getOrderedRights,
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
      const expenses = this.statement.expenseIds.map(id => _expenses.find(i => i.id === id))

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
    this.sources$, this.statement$, this.shell.incomes$,
    this.statementsHistory$, this.shell.rights$, this.shell.simulation$
  ]).pipe(
    map(([sources, current, incomes, _history, rights, simulation]) => {
      const indexOfCurrent = _history.findIndex(s => s.id === current.id);
      _history[indexOfCurrent] = { ...current, number: _history[indexOfCurrent].number };
      const previous = _history.slice(indexOfCurrent + 1);
      const history = _history.slice(indexOfCurrent);

      const displayedRights = getStatementRightsToDisplay(current, rights);
      const orderedRights = getOrderedRights(displayedRights, simulation.waterfall.state);

      return sources.map(source => {
        const rows: { section: string, type?: 'right' | 'net', previous: PricePerCurrency, current: PricePerCurrency, cumulated: PricePerCurrency, rightId?: string }[] = [];

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
        for (const right of rights) {
          const section = right.type ? `${right.name} (${toLabel(right.type, 'rightTypes')} - ${right.percent}%)` : `${right.name} (${right.percent}%)`;
          const previousRightPayment = previous.map(s => s.payments.right).flat().filter(p => p.to === right.id);
          previousSum.push(...previousRightPayment.map(r => ({ ...r, price: -r.price })));
          const currentRightPayment = current.payments.right.filter(p => p.to === right.id);
          currentSum.push(...currentRightPayment.map(r => ({ ...r, price: -r.price })));
          const cumulatedRightPayment = history.map(s => s.payments.right).flat().filter(p => p.to === right.id);
          cumulatedSum.push(...cumulatedRightPayment.map(r => ({ ...r, price: -r.price })));
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

        return { name: source.name, rows, net: currentNet };
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

  public rightsBreakdown$ = combineLatest([this.statement$, this.statementsHistory$, this.shell.rights$, this.shell.simulation$]).pipe(
    map(([current, _history, rights, simulation]) => {
      const indexOfCurrent = _history.findIndex(s => s.id === current.id);
      _history[indexOfCurrent] = { ...current, number: _history[indexOfCurrent].number };
      const previous = _history.slice(indexOfCurrent + 1);
      const history = _history.slice(indexOfCurrent);

      const displayedRights = getStatementRightsToDisplay(current, rights);
      const orderedRights = getOrderedRights(displayedRights, simulation.waterfall.state);
      const rightsWithManySources = orderedRights.filter(right => getSources(simulation.waterfall.state, right.id).length > 1);

      const rightTypes = unique(rightsWithManySources.map(right => right.type));

      return rightTypes.map(type => {
        const rows: { section: string, previous: PricePerCurrency, current: PricePerCurrency, cumulated: PricePerCurrency, rightId: string }[] = [];

        for (const right of rightsWithManySources) {
          if (right.type !== type) continue;

          const section = `${right.name} (${right.percent}%)`;
          const previousRightPayment = previous.map(s => s.payments.right).flat().filter(p => p.to === right.id);
          const currentRightPayment = current.payments.right.filter(p => p.to === right.id);
          const cumulatedRightPayment = history.map(s => s.payments.right).flat().filter(p => p.to === right.id);
          rows.push({
            section,
            rightId: right.id,
            previous: getTotalPerCurrency(previousRightPayment),
            current: getTotalPerCurrency(currentRightPayment),
            cumulated: getTotalPerCurrency(cumulatedRightPayment)
          });
        }

        const total = rows.map(r => r.current).reduce((acc, curr) => {
          for (const currency of Object.keys(curr)) {
            acc[currency] = (acc[currency] || 0) + curr[currency];
          }
          return acc;
        }, {});

        return { name: toLabel(type, 'rightTypes'), rows, total };
      });
    })
  );

  private waterfall = this.shell.waterfall;

  constructor(private shell: DashboardWaterfallShellComponent) { }

}