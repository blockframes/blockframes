import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from '@blockframes/contract/expense/service';
import { IncomeService } from '@blockframes/contract/income/service';
import { createIncome, Statement, createExpense, Income, Expense, Waterfall } from '@blockframes/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { unique } from '@blockframes/utils/helpers';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementForm } from '@blockframes/waterfall/form/statement.form';
import { StartementFormGuardedComponent } from '@blockframes/waterfall/guards/statement-form.guard';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { Subscription, combineLatest, debounceTime, map, pluck, tap } from 'rxjs';

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

  public statement$ = combineLatest([this.statementId, this.shell.statements$]).pipe(
    map(([statementId, statements]) => statements.find(s => s.id === statementId))
  );

  public waterfall$ = this.shell.waterfall$;

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

  public async save(statement: Statement, waterfall: Waterfall, redirect = false) {
    if (this.form.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const value = this.form.value;

    statement.reported = value.reported;
    statement.duration = value.duration;

    const declaredIncomes = waterfall.sources
      .map(source => ({ source, incomes: this.form.getIncomes(source.id) }))
      .filter(v => v.incomes?.length);

    const incomes = declaredIncomes.map(value => {
      return value.incomes.map(i => {
        const income = createIncome({
          ...i,
          medias: i.medias.filter(m => value.source.medias.includes(m)),
          territories: i.territories.filter(m => value.source.territories.includes(m)),
          titleId: waterfall.id,
          contractId: statement.contractId,
          date: statement.duration.to,
        });

        if (!income.medias.length) income.medias = value.source.medias;
        if (!income.territories.length) income.territories = value.source.territories;
        if (!income.medias.length || !income.territories.length) income.sourceId = value.source.id;
        return income;
      });
    }).flat();

    await this.incomeService.update(incomes.filter(i => i.id));
    const newIncomeIds = await this.incomeService.add(incomes.filter(i => !i.id));

    // If incomeIds are removed from the statement, backend-function will remove them from the income collection
    statement.incomeIds = unique([...incomes.filter(i => i.id).map(i => i.id), ...newIncomeIds]);

    const expenseTypes = waterfall.expenseTypes[statement.contractId || 'directSales'] || [];
    const declaredExpenses = expenseTypes
      .map(expenseType => ({ expenseType, expenses: this.form.getExpenses(expenseType.id) }))
      .filter(v => v.expenses?.length);

    const expenses = declaredExpenses.map(value => {
      return value.expenses.map(expense => createExpense({
        ...expense,
        typeId: value.expenseType.id,
        titleId: waterfall.id,
        contractId: value.expenseType.contractId,
        rightholderId: statement.senderId,
        date: statement.duration.to,
      }));
    }).flat();

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

    await this.statementService.update(statement, { params: { waterfallId: waterfall.id } });

    // Update the simulation for next step
    await this.shell.simulateWaterfall();

    this.form.markAsPristine();

    if (redirect) this.router.navigate(['..'], { relativeTo: this.route });
    else this.snackBar.open('Statement updated !', 'close', { duration: 5000 });
  }


}