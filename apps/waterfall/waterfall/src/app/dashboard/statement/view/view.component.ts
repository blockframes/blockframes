import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from '@blockframes/contract/expense/service';
import { IncomeService } from '@blockframes/contract/income/service';
import {
  NegotiationStatus,
  RightType,
  Statement,
  createDocumentMeta,
  createIncomePayment,
  createRightPayment,
  createRightholderPayment,
  createStatement,
  filterStatements,
  generatePayments,
  getAssociatedRights,
  getDefaultVersionId,
  getDistributorExpensesDetails,
  getExpensesHistory,
  getParentStatements,
  getRightsBreakdown,
  getSourcesBreakdown,
  getStatementRights,
  getStatementSources,
  isDirectSalesStatement,
  isDistributorStatement,
  isProducerStatement,
  isStandaloneVersion,
  preferredLanguage,
  sortStatements,
  toLabel
} from '@blockframes/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { unique } from '@blockframes/utils/helpers';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementForm } from '@blockframes/waterfall/form/statement.form';
import { StartementFormGuardedComponent } from '@blockframes/waterfall/guards/statement-form.guard';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { CallableFunctions } from 'ngfire';
import { Subscription, debounceTime, filter, firstValueFrom, pluck, switchMap, tap } from 'rxjs';

@Component({
  selector: 'waterfall-statement-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementViewComponent implements OnInit, OnDestroy, StartementFormGuardedComponent {

  private statementId = this.route.params.pipe(
    pluck('statementId'),
    tap((statementId: string) => {
      this.shell.currentStatementId$.next(statementId);
      this.form.reset(); // Statement Id has changed, reset form
    })
  );

  public statement$ = this.statementId.pipe(
    switchMap((statementId: string) => this.statementService.valueChanges(statementId, { waterfallId: this.waterfall.id })),
    filter(statement => !!statement),
    tap(statement => {
      if (statement.versionId) this.shell.setVersionId(statement.versionId);
      if (this.shell.setDate(statement.duration.to)) {
        this.shell.simulateWaterfall();
        this.form.setAllValue(statement);
      }
    })
  );

  private waterfall = this.shell.waterfall;

  public form: StatementForm;
  public canBypassRules = this.shell.canBypassRules;
  private sub: Subscription;
  private lang = preferredLanguage();

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private statementService: StatementService,
    private expenseService: ExpenseService,
    private incomeService: IncomeService,
    private snackBar: MatSnackBar,
    private router: Router,
    private functions: CallableFunctions,
  ) {
    this.dynTitle.setPageTitle(this.shell.movie.title.international, $localize`View Statement`);
    this.form = new StatementForm();
  }

  ngOnInit() {
    this.sub = this.form.get('duration').get('to').valueChanges.pipe(debounceTime(500)).subscribe(date => {
      const control = this.form.get('duration').get('to');
      const inError = control.hasError('startOverEnd') || control.hasError('isBefore') || control.hasError('maxDate');
      if (!inError && this.shell.setDate(date)) this.shell.simulateWaterfall();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  public report(statement: Statement) {
    return this.save(statement, true);
  }

  public async reviewStatement(statement: Statement, reviewStatus: NegotiationStatus) {
    if (!this.canBypassRules) return;
    statement.reviewStatus = reviewStatus;
    if (reviewStatus === 'accepted') {
      const snackbarRef = this.snackBar.open($localize`Please wait, statement is being accepted...`);
      await this.statementService.update(statement, { params: { waterfallId: this.waterfall.id } });
      await this.shell.refreshAllWaterfalls();
      snackbarRef.dismiss();
    } else {
      statement.status = 'draft';
      await this.statementService.update(statement, { params: { waterfallId: this.waterfall.id } });
    }

    this.snackBar.open($localize`Statement ${reviewStatus}`, 'close', { duration: 5000 });
  }

  public async save(statement: Statement, reported = false) {
    if (this.form.invalid) {
      this.snackBar.open($localize`Information not valid`, 'close', { duration: 5000 });
      return;
    }

    const value = this.form.value;

    statement.reported = value.reported;
    statement.duration = value.duration;

    statement.comment = value.comment;

    // Add an id to the payments if they don't have one and update internal right payments status
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
      statement.versionId = this.shell.versionId$.value;

      if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) {
        await this.incomeService.update(statement.incomeIds, (i) => {
          return { ...i, status: 'received' };
        });

        await this.expenseService.update(statement.expenseIds, (e) => {
          return { ...e, status: 'received' };
        });
      }
    }

    if (!this.shell.canBypassRules) {
      statement.reviewStatus = 'pending';
    } else if (statement.reviewStatus) {
      statement.reviewStatus = 'accepted';
    }

    await this.statementService.update(statement, { params: { waterfallId: this.waterfall.id } });

    // Update the simulation
    await this.shell.simulateWaterfall();

    if (reported) {
      const snackbarRef = this.snackBar.open($localize`Please wait, statement is being reported...`);

      if (isProducerStatement(statement) && !isStandaloneVersion(this.shell.waterfall, statement.versionId)) {
        if (statement.versionId !== getDefaultVersionId(this.shell.waterfall)) {
          await this.duplicateParentStatements(statement);
        } else {
          await this.updateParentStatements(statement);
        }
      }

      // Statement is reported, actual waterfalls are refreshed
      if (this.shell.canBypassRules) {
        await this.shell.refreshAllWaterfalls();
        snackbarRef.dismiss();
        this.snackBar.open($localize`Statement reported`, 'close', { duration: 5000 });
        this.router.navigate(['/c/o/dashboard/title', this.shell.waterfall.id, 'statements']);
      } else {
        // If user is not admin, create a notification to producer to review and refresh the waterfall to commit the statement
        const output = await this.functions.call<{ waterfallId: string, statementId: string }, boolean>('requestStatementReview', { waterfallId: this.waterfall.id, statementId: statement.id });
        snackbarRef.dismiss();
        if (!output) {
          this.snackBar.open('An error occurred, please try again.', 'close', { duration: 5000 });
        } else {
          this.snackBar.open($localize`Statement reported. A request to review the Statement has been sent to the ${toLabel('producer', 'rightholderRoles')}.`, 'close', { duration: 5000 });
          this.router.navigate(['/c/o/dashboard/title', this.shell.waterfall.id, 'statements']);
        }
      }

    } else {
      this.snackBar.open($localize`Statement updated`, 'close', { duration: 5000 });
      this.router.navigate(['/c/o/dashboard/title', this.shell.waterfall.id, 'statements']);
    }

    this.form.markAsPristine();
  }

  /**
   * Used to apply or revert arbitrary changes made to an outgoing statement.
   * This method will re-write right payments of impacted (parents) statements.
   * @see libs/waterfall/src/lib/components/statement/statement-arbitrary-change/statement-arbitrary-change.component.ts
   * @param statement 
   * @returns 
   */
  private async updateParentStatements(statement: Statement) {
    const incomeIds = statement.payments.right.map(payment => payment.incomeIds).flat();
    const statements = await this.shell.statements();
    const simulation = await firstValueFrom(this.shell.simulation$);
    const _rights = await this.shell.rights();
    const incomes = await this.shell.incomes();
    const expenses = await this.shell.expenses();

    const impactedStatements = getParentStatements(statements, incomeIds);

    // Rewrite right payments of impacted statements
    const statementsToUpdate = impactedStatements.map(impactedStatement => {
      const filteredStatements = filterStatements(impactedStatement.type, [impactedStatement.senderId, impactedStatement.receiverId], impactedStatement.contractId, statements);
      const history = sortStatements(filteredStatements);
      // Reset right payments
      const existingPaymentInfos = impactedStatement.payments.right.map(p => ({ id: p.id, to: p.to, date: p.date, status: p.status }));
      impactedStatement.payments.right = isDirectSalesStatement(impactedStatement) ? [] : impactedStatement.payments.right.filter(p => p.mode === 'internal');

      const declaredSources = getStatementSources(impactedStatement, this.waterfall.sources, incomes, _rights, simulation.waterfall.state);
      const statementRights = getStatementRights(impactedStatement, _rights);
      const rightIds = unique(declaredSources.map(s => getAssociatedRights(s.id, statementRights, simulation.waterfall.state)).flat().map(r => r.id));
      const rights = statementRights.filter(r => rightIds.includes(r.id));

      const updatedStatement = generatePayments(impactedStatement, simulation.waterfall.state, rights, incomes);
      updatedStatement.payments.right = impactedStatement.payments.right.map(p => {
        const existingPaymentInfo = existingPaymentInfos.find(info => info.to === p.to);
        const payment = createRightPayment({ ...p, id: existingPaymentInfo.id, status: existingPaymentInfo.status });
        if (existingPaymentInfo.date) payment.date = existingPaymentInfo.date;
        return payment;
      });

      // On direct sales statements, only display commission and expenses rights
      // This is needed to show only theses kind of rights since directSales statements does not have a contract Id.
      const displayedRightTypes: RightType[] = isDirectSalesStatement(impactedStatement) ? ['commission', 'expenses'] : [];

      updatedStatement.reportedData.sourcesBreakdown = getSourcesBreakdown(
        this.shell.waterfall,
        declaredSources,
        updatedStatement,
        incomes,
        expenses,
        history,
        _rights,
        simulation.waterfall.state,
        this.lang,
        displayedRightTypes
      );

      updatedStatement.reportedData.rightsBreakdown = getRightsBreakdown(
        this.waterfall,
        updatedStatement,
        incomes,
        expenses,
        history,
        _rights,
        simulation.waterfall.state,
        declaredSources,
        this.lang,
        displayedRightTypes
      );

      updatedStatement.reportedData.expenses = getExpensesHistory(updatedStatement, history, expenses, declaredSources, _rights, simulation.waterfall.state, incomes);

      updatedStatement.reportedData.distributorExpenses = getDistributorExpensesDetails(
        [updatedStatement],
        updatedStatement.reportedData.expenses,
        this.waterfall
      );

      return updatedStatement;
    });
    return this.statementService.update(statementsToUpdate, { params: { waterfallId: this.waterfall.id } });
  }

  /**
   * If outgoing statement was not created with default version, parents statements should be duplicated
   * to integrate changes made to declared incomes and expenses
   * @param statement 
   */
  private async duplicateParentStatements(statement: Statement) {
    const incomeIds = statement.payments.right.map(payment => payment.incomeIds).flat();
    const statements = await this.shell.statements();
    const simulation = await firstValueFrom(this.shell.simulation$);
    const _rights = await this.shell.rights();
    const incomes = await this.shell.incomes();
    const expenses = await this.shell.expenses();

    const impactedStatements = getParentStatements(statements, incomeIds, true);

    // Rewrite right payments of impacted statements
    const statementsToUpdate = impactedStatements.map(impactedStatement => {
      const filteredStatements = filterStatements(impactedStatement.type, [impactedStatement.senderId, impactedStatement.receiverId], impactedStatement.contractId, statements);
      const history = sortStatements(filteredStatements);
      // Reset incomes payments
      const existingIncomePaymentInfos = impactedStatement.payments.income.map(p => ({ id: p.id, incomeId: p.incomeId }));
      impactedStatement.payments.income = [];

      // Reset right payments
      const existingRightPaymentInfos = impactedStatement.payments.right.map(p => ({ id: p.id, to: p.to, date: p.date, status: p.status }));
      impactedStatement.payments.right = [];
      // Reset rightholder payment
      const existingRightholderPaymentInfo = isDistributorStatement(impactedStatement) ? {
        id: impactedStatement.payments.rightholder.id,
        date: impactedStatement.payments.rightholder.date,
        status: impactedStatement.payments.rightholder.status
      } : undefined;
      delete impactedStatement.payments.rightholder;

      const declaredSources = getStatementSources(impactedStatement, this.waterfall.sources, incomes, _rights, simulation.waterfall.state);
      const statementRights = getStatementRights(impactedStatement, _rights);
      const rightIds = unique(declaredSources.map(s => getAssociatedRights(s.id, statementRights, simulation.waterfall.state)).flat().map(r => r.id));
      const rights = statementRights.filter(r => rightIds.includes(r.id));

      const updatedStatement = generatePayments(impactedStatement, simulation.waterfall.state, rights, incomes);
      updatedStatement.payments.right = impactedStatement.payments.right.map(p => {
        const existingPaymentInfo = existingRightPaymentInfos.find(info => info.to === p.to);
        const payment = createRightPayment({ ...p, id: existingPaymentInfo.id, status: existingPaymentInfo.status });
        if (existingPaymentInfo.date) payment.date = existingPaymentInfo.date;
        return payment;
      });

      if (isDistributorStatement(impactedStatement)) {
        const existingPaymentInfo = existingRightholderPaymentInfo;
        updatedStatement.payments.rightholder = createRightholderPayment({ ...impactedStatement.payments.rightholder, id: existingPaymentInfo.id, status: existingPaymentInfo.status });
        if (existingPaymentInfo.date) updatedStatement.payments.rightholder.date = existingPaymentInfo.date;
      }

      updatedStatement.payments.income = impactedStatement.payments.income.map(p => {
        const existingPaymentInfo = existingIncomePaymentInfos.find(info => info.incomeId === p.incomeId);
        const payment = createIncomePayment({ ...p, id: existingPaymentInfo.id });
        return payment;
      });

      updatedStatement.versionId = this.shell.versionId$.value;

      // On direct sales statements, only display commission and expenses rights
      // This is needed to show only theses kind of rights since directSales statements does not have a contract Id.
      const displayedRightTypes: RightType[] = isDirectSalesStatement(impactedStatement) ? ['commission', 'expenses'] : [];

      updatedStatement.reportedData.sourcesBreakdown = getSourcesBreakdown(
        this.shell.waterfall,
        declaredSources,
        updatedStatement,
        incomes,
        expenses,
        history,
        _rights,
        simulation.waterfall.state,
        this.lang,
        displayedRightTypes
      );

      updatedStatement.reportedData.rightsBreakdown = getRightsBreakdown(
        this.waterfall,
        updatedStatement,
        incomes,
        expenses,
        history,
        _rights,
        simulation.waterfall.state,
        declaredSources,
        this.lang,
        displayedRightTypes
      );

      updatedStatement.reportedData.expenses = getExpensesHistory(updatedStatement, history, expenses, declaredSources, _rights, simulation.waterfall.state, incomes);

      updatedStatement.reportedData.distributorExpenses = getDistributorExpensesDetails(
        [updatedStatement],
        updatedStatement.reportedData.expenses,
        this.waterfall
      );

      return updatedStatement;
    });

    const statementsToDuplicate = statementsToUpdate.map(s => (createStatement({
      ...s,
      _meta: createDocumentMeta(),
      id: this.statementService.createId(),
      duplicatedFrom: s.id,
    })));

    return this.statementService.add(statementsToDuplicate, { params: { waterfallId: this.waterfall.id } });
  }

}