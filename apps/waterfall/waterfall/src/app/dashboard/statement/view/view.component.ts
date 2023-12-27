import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
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
import { StartementFormGuardedComponent } from '@blockframes/waterfall/guards/statement-form.guard';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { Subscription, combineLatest, debounceTime, filter, firstValueFrom, map, pluck, tap } from 'rxjs';

@Component({
  selector: 'waterfall-statement-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementViewComponent implements OnInit, OnDestroy, StartementFormGuardedComponent {

  private statementId = this.route.params.pipe(
    pluck('statementId'),
    tap(_ => this.form.reset()) // Statement Id has changed, reset form
  );

  public statement$ = combineLatest([this.statementId, this.shell.statements$]).pipe(
    map(([statementId, statements]) => statements.find(s => s.id === statementId)),
    filter(statement => !!statement),
    tap(statement => {
      if (this.shell.setDate(statement.duration.to)) {
        this.shell.simulateWaterfall();
        this.form.setAllValue(statement);
      }
    })
  );

  private waterfall = this.shell.waterfall;

  public form: StatementForm;
  private sub: Subscription;

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
    const versionId = this.waterfall.versions[0]?.id; // TODO #9520 versionId selector or via url
    if (versionId) this.shell.setVersionId(versionId);
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

  public report(statement: Statement) {
    return this.save(statement, true);
  }

  public async save(statement: Statement, reported = false) {
    if (this.form.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const value = this.form.value;

    statement.reported = value.reported;
    statement.duration = value.duration;

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

      if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) {
        await this.incomeService.update(statement.incomeIds, (i) => {
          return { ...i, status: 'received' };
        });

        await this.expenseService.update(statement.expenseIds, (e) => {
          return { ...e, status: 'received' };
        });
      }
    };

    await this.statementService.update(statement, { params: { waterfallId: this.waterfall.id } });

    // Update the simulation
    await this.shell.simulateWaterfall();

    if (reported) {
      // TODO #9420 what if statement is put back to draft, how to revert the changes ?
      if (isProducerStatement(statement) && statement.rightOverrides.length > 0) {
        const incomeIds = statement.rightOverrides.map(override => override.incomeId);
        const statements = await this.shell.statements();
        const simulation = await firstValueFrom(this.shell.simulation$);
        const _rights = await this.shell.rights();
        const incomes = await this.shell.incomes();

        const impactedStatements = statements.filter(s => isDirectSalesStatement(s) || isDistributorStatement(s))
          .filter(s => s.payments.right.some(r => r.incomeIds.some(id => incomeIds.includes(id))));

        // Rewrite right payments of impacted statements
        const statementsToUpdate: Statement[] = [];
        for (const impactedStatement of impactedStatements) {

          // Reset right payments
          const existingPaymentInfos = impactedStatement.payments.right.map(p => ({ id: p.id, to: p.to, date: p.date, status: p.status }));
          impactedStatement.payments.right = [];

          const sources = getStatementSources(impactedStatement, this.waterfall.sources, incomes, _rights, simulation.waterfall.state);
          const statementRights = getStatementRights(impactedStatement, _rights);
          const rightIds = unique(sources.map(s => getAssociatedRights(s.id, statementRights, simulation.waterfall.state)).flat().map(r => r.id));
          const rights = statementRights.filter(r => rightIds.includes(r.id));

          const updatedStatements = generatePayments(impactedStatement, simulation.waterfall.state, rights, incomes, sources);
          if (impactedStatement.status === 'reported') {
            updatedStatements.payments.right = impactedStatement.payments.right.map(p => {
              const existingPaymentInfo = existingPaymentInfos.find(info => info.to === p.to);
              
              const payment = {
                ...p,
                id: existingPaymentInfo.id,
                status: existingPaymentInfo.status
              }

              if (existingPaymentInfo.date) payment.date = existingPaymentInfo.date;

              return payment;
            });
          }
          statementsToUpdate.push(updatedStatements);
        }
        await this.statementService.update(statementsToUpdate, { params: { waterfallId: this.waterfall.id } });
      }

      // Statement is reported, actual waterfall is refreshed
      await this.shell.refreshWaterfall();
      this.snackBar.open('Statement reported !', 'close', { duration: 5000 });
    } else {
      this.snackBar.open('Statement updated !', 'close', { duration: 5000 });
    }

    this.form.markAsPristine();
  }

}