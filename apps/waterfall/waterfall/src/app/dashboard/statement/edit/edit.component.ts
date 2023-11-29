import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from '@blockframes/contract/expense/service';
import { IncomeService } from '@blockframes/contract/income/service';
import { WaterfallSource, createIncome, getStatementSources, Statement, createMissingIncomes, createExpense } from '@blockframes/model';

import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { unique } from '@blockframes/utils/helpers';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementForm } from '@blockframes/waterfall/form/statement.form';
import { StartementFormGuardedComponent } from '@blockframes/waterfall/guards/statement-form.guard';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { Subscription, combineLatest, debounceTime, map, pluck, shareReplay, tap } from 'rxjs';

@Component({
  selector: 'waterfall-statement-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementEditComponent implements OnInit, OnDestroy, StartementFormGuardedComponent {

  private statementId = this.route.params.pipe(
    pluck('statementId'),
    tap(_ => this.form.reset()) // Statement Id has changed, reset form
  );

  private _statement$ = combineLatest([this.statementId, this.shell.statements$]).pipe(
    map(([statementId, statements]) => statements.find(s => s.id === statementId))
  );

  public sources$ = combineLatest([this._statement$, this.shell.incomes$, this.shell.rights$, this.shell.simulation$]).pipe(
    map(([statement, incomes, rights, simulation]) => getStatementSources(statement, this.waterfall.sources, incomes, rights, simulation.waterfall.state)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public statement$ = combineLatest([this._statement$, this.shell.incomes$, this.shell.expenses$, this.sources$]).pipe(
    map(([statement, _incomes, _expenses, sources]) => {
      const incomes = statement.incomeIds.map(id => _incomes.find(i => i.id === id));
      const expenses = statement.expenseIds.map(id => _expenses.find(i => i.id === id));

      const missingIncomes = createMissingIncomes(sources, incomes, statement, this.waterfall);
      if (this.form.pristine) this.form.setAllValue({ ...statement, incomes: [...incomes, ...missingIncomes], expenses, sources });
      return statement;
    })
  );

  private waterfall = this.shell.waterfall;

  public form: StatementForm;
  private sub: Subscription;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private incomeService: IncomeService,
    private statementService: StatementService,
    private expenseService: ExpenseService
  ) {
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'Edit Statement');
    this.shell.simulateWaterfall();

    this.form = new StatementForm();
  }

  ngOnInit() {
    this.sub = this.form.get('duration').get('to').valueChanges.pipe(debounceTime(500)).subscribe(date => {
      const control = this.form.get('duration').get('to');
      const inError = control.hasError('startOverEnd') || control.hasError('isBefore');
      if (!inError && this.shell.setDate(date)) this.shell.simulateWaterfall();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  public async save(sources: WaterfallSource[], statement: Statement, redirect = false) {
    if (this.form.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const value = this.form.value;

    statement.reported = value.reported;
    statement.duration = value.duration;

    const incomes = sources.map(source => value[source.id]).flat().map(income => createIncome({
      ...income,
      titleId: this.waterfall.id,
      contractId: statement.contractId,
      date: statement.duration.to,
    }));

    await this.incomeService.update(incomes.filter(i => i.id));
    const newIncomeIds = await this.incomeService.add(incomes.filter(i => !i.id));

    // If incomeIds are removed from the statement, backend-function will remove them from the income collection
    statement.incomeIds = unique([...incomes.filter(i => i.id).map(i => i.id), ...newIncomeIds]);

    const expenses = value.expenses.map(expense => createExpense({
      ...expense,
      titleId: this.waterfall.id,
      contractId: statement.contractId,
      rightholderId: statement.senderId,
      date: statement.duration.to,
    }));

    await this.expenseService.update(expenses.filter(e => e.id));
    const newExpenseIds = await this.expenseService.add(expenses.filter(e => !e.id));

    // If expenseIds are removed from the statement, backend-function will remove them from the expense collection
    statement.expenseIds = unique([...expenses.filter(e => e.id).map(e => e.id), ...newExpenseIds]);

    if (statement.status === 'draft') {
      // Put back incomes and expenses to pending
      await this.incomeService.update(incomes.filter(i => i.status === 'received').map(i => i.id), i => {
        return { ...i, status: 'pending' };
      });

      await this.expenseService.update(expenses.filter(e => e.status === 'received').map(e => e.id), e => {
        return { ...e, status: 'pending' };
      });

      statement.payments.income = [];
      statement.payments.right = [];
      delete statement.payments.rightholder;
      delete statement.reported;
    }

    await this.statementService.update(statement, { params: { waterfallId: this.waterfall.id } });

    // Update the simulation for next step
    await this.shell.simulateWaterfall();

    this.form.markAsPristine();

    if (redirect) this.router.navigate(['..'], { relativeTo: this.route });
    else this.snackBar.open('Statement updated !', 'close', { duration: 5000 });
  }


}