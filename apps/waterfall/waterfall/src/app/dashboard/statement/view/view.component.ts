import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ExpenseService } from '@blockframes/contract/expense/service';
import { IncomeService } from '@blockframes/contract/income/service';
import {
  Statement,
  createIncomePayment,
  createRightPayment,
  createRightholderPayment,
  generatePayments,
  getAssociatedRights,
  getStatementRights,
  getStatementSources,
  isDirectSalesStatement,
  isDistributorStatement,
  isProducerStatement
} from '@blockframes/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { unique } from '@blockframes/utils/helpers';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementForm } from '@blockframes/waterfall/form/statement.form';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { combineLatest, map, pluck, shareReplay, switchMap, tap } from 'rxjs';

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

  public sources$ = combineLatest([this._statement$, this.shell.incomes$, this.shell.rights$, this.shell.simulation$]).pipe(
    map(([statement, incomes, rights, simulation]) => getStatementSources(statement, this.waterfall.sources, incomes, rights, simulation.waterfall.state)),
    shareReplay({ bufferSize: 1, refCount: true })
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