import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ExpenseService } from '@blockframes/contract/expense/service';
import { IncomeService } from '@blockframes/contract/income/service';
import {
  PricePerCurrency,
  RightPayment,
  Statement,
  createIncomePayment,
  createRightPayment,
  createRightholderPayment,
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
  isDirectSalesStatement,
  isDistributorStatement,
  isProducerStatement,
  sortStatements,
  toLabel
} from '@blockframes/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { unique } from '@blockframes/utils/helpers';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementForm } from '@blockframes/waterfall/form/statement.form';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { combineLatest, map, pluck, switchMap, tap } from 'rxjs';

@Component({
  selector: 'waterfall-statement-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementViewComponent {

  private _statement$ = combineLatest([this.route.params.pipe(pluck('statementId')), this.shell.statements$]).pipe(
    map(([statementId, statements]) => statements.find(s => s.id === statementId)),
    tap(statement => {
      if (this.shell.setDate(statement.duration.to)) {
        this.shell.simulateWaterfall();
      }
    })
  );

  private statementsHistory$ = combineLatest([this._statement$, this.shell.statements$]).pipe(
    map(([current, statements]) => filterStatements(current.type, [current.senderId, current.receiverId], current.contractId, statements)),
    map(statements => sortStatements(statements))
  );

  public sources$ = combineLatest([this._statement$, this.shell.incomes$, this.shell.rights$, this.shell.simulation$]).pipe(
    map(([statement, incomes, rights, simulation]) => getStatementSources(statement, this.waterfall.sources, incomes, rights, simulation.waterfall.state)),
  );

  public statement$ = combineLatest([
    this._statement$, this.shell.incomes$, this.shell.expenses$,
    this.sources$, this.shell.rights$, this.shell.simulation$
  ]).pipe(
    switchMap(async ([statement, _incomes, _expenses, sources, _rights, simulation]) => {
      const incomes = statement.incomeIds.map(id => _incomes.find(i => i.id === id));
      const expenses = statement.expenseIds.map(id => _expenses.find(i => i.id === id));

      // Refresh waterfall if some incomes or expenses are not in the simulated waterfall
      const missingIncomeIds = statement.incomeIds.filter(i => !simulation.waterfall.state.incomes[i]);
      const missingExpenseIds = statement.expenseIds.filter(i => !simulation.waterfall.state.expenses[i]);
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

      const statementRights = getStatementRights(statement, _rights);
      const rightIds = unique(sources.map(s => getAssociatedRights(s.id, statementRights, simulation.waterfall.state)).flat().map(r => r.id));
      const rights = statementRights.filter(r => rightIds.includes(r.id));

      statement = generatePayments(statement, simulation.waterfall.state, rights, incomes, sources);
      this.form.setAllValue({ ...statement, incomes, expenses, sources });

      return statement;
    }),
  );

  public sourcesBreakdown$ = combineLatest([
    this.sources$, this.shell.incomes$, this.statementsHistory$,
    this.statement$, this.shell.rights$, this.shell.simulation$
  ]).pipe(
    map(([sources, incomes, _history, current, rights, simulation]) => {
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

  public rightsBreakdown$ = combineLatest([this.statementsHistory$, this.statement$, this.shell.rights$, this.shell.simulation$]).pipe(
    map(([_history, current, rights, simulation]) => {
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

  public form: StatementForm;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private statementService: StatementService,
    private expenseService: ExpenseService,
    private incomeService: IncomeService,
    private snackBar: MatSnackBar,
  ) {
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'View Statement');

    this.form = new StatementForm();
  }

  public editRightPayment(payment: RightPayment) {
    console.log(payment);

    this.shell.simulateWaterfall();
    // TODO #9524 update form, regenerate payments, update simulation ...
  }

  public report(statement: Statement) {
    return this.save(statement, true);
  }

  public async save(statement: Statement, reported = false) {
    if (this.form.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const value = this.form.value;

    statement.comment = value.comment;

    // Add an id to the payments if they don't have one and update interal right payments status
    if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) {
      const incomePayments = value.incomePayments.map(p => createIncomePayment({
        ...p,
        id: p.id || this.statementService.createId()
      }));
      statement.payments.income = incomePayments;
    }

    const rightPayments = value.rightPayments.map(p => createRightPayment({
      ...p,
      id: p.id || this.statementService.createId(),
      status: p.mode === 'internal' ? 'received' : p.status
    }));
    statement.payments.right = rightPayments;

    if (isDistributorStatement(statement) || isProducerStatement(statement)) {
      const rightholderPayment = createRightholderPayment({
        ...value.rightholderPayment,
        id: value.rightholderPayment.id || this.statementService.createId()
      });
      statement.payments.rightholder = rightholderPayment;
    }

    if (reported) {
      statement.status = 'reported';
      statement.reported = value.reported;

      await this.incomeService.update(statement.incomeIds, (i) => {
        return { ...i, status: 'received' };
      });

      await this.expenseService.update(statement.expenseIds, (e) => {
        return { ...e, status: 'received' };
      });

    };

    await this.statementService.update(statement, { params: { waterfallId: this.waterfall.id } });

    // Update the simulation
    await this.shell.simulateWaterfall();

    if (reported) {
      this.snackBar.open('Statement reported !', 'close', { duration: 5000 });
      // Statement is reported, actual waterfall is refreshed
      await this.shell.refreshWaterfall();
    } else {
      this.snackBar.open('Statement updated !', 'close', { duration: 5000 });
    }

  }

}