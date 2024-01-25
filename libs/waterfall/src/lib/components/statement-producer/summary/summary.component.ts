import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  ProducerBreakdownRow as BreakdownRow,
  ConditionInterest,
  DetailsRow,
  Duration,
  Expense,
  GroupsBreakdown,
  Income,
  PricePerCurrency,
  Right,
  RightOverride,
  Statement,
  StatementStatus,
  TitleState,
  WaterfallSource,
  generatePayments,
  getAssociatedRights,
  getCalculatedAmount,
  getChildRights,
  getDefaultVersionId,
  getGroup,
  getIncomingAmount,
  getOrderedRights,
  getPath,
  getPathDetails,
  getRightCondition,
  getSources,
  getStatementRights,
  getStatementRightsToDisplay,
  getStatementSources,
  getTransferDetails,
  isDefaultVersion,
  isDirectSalesStatement,
  isDistributorStatement,
  isSource,
  isStandaloneVersion,
  isVerticalGroup,
  interestDetail
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../form/statement.form';
import { BehaviorSubject, Observable, Subscription, combineLatest, debounceTime, map, shareReplay, tap } from 'rxjs';
import { unique } from '@blockframes/utils/helpers';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { StatementArbitraryChangeComponent } from '../../statement-arbitrary-change/statement-arbitrary-change.component';
import { StatementService } from '../../../statement.service';
import { StatementIncomeEditComponent } from '../../statement-income-edit/statement-income-edit.component';
import { IncomeService } from '@blockframes/contract/income/service';
import { StatementExpenseEditComponent } from '../../statement-expense-edit/statement-expense-edit.component';
import { ExpenseService } from '@blockframes/contract/expense/service';

function getRightTurnover(incomeIds: string[], state: TitleState, right: Right, sources: WaterfallSource[], statementIncomes: Income[], statementStatus: StatementStatus, versionId: string): BreakdownRow[] {
  const sourceIds = getSources(state, right.id).map(i => i.id);

  return sources.filter(s => sourceIds.includes(s.id)).map(s => {
    const path = getPath(right.id, s.id, state);

    const to = path[path.length - 1];
    const from = path[path.indexOf(to) - 1];
    const details = getTransferDetails(incomeIds, s.id, from, to, state);
    return { ...s, taken: details.amount };
  }).map(source => ({ name: source.name, taken: source.taken, type: 'source', source, right } as BreakdownRow))
    .filter(row => {
      if (statementStatus === 'draft') return true;
      // Remove sources where all incomes are hidden from reported statement 
      const sourceIncomes = statementIncomes.filter(i => i.sourceId === row.source.id);
      const allHidden = sourceIncomes.every(i => i.version[versionId]?.hidden);
      return !allHidden;
    })
}

function getRightTaken(rights: Right[], statement: Statement, state: TitleState, rightId: string, sources: WaterfallSource[], incomes: Income[]): BreakdownRow {
  const right = rights.find(r => r.id === rightId);
  const sourceIds = getSources(state, rightId).map(i => i.id);

  const details = sources.filter(s => sourceIds.includes(s.id)).map(s => {
    const path = getPath(rightId, s.id, state);

    const to = path[path.length - 1];
    const from = path[path.indexOf(to) - 1];
    return getTransferDetails(statement.incomeIds, s.id, from, to, state);
  });

  /**
   * @dev taken (mainCurrency) and currentRightPayment (statement currency) should be the same.
   * details variable could be used to re-build percentage actually used (if overriden via statement.rightOverrides or updateRight action) 
   */
  const taken = details.reduce((acc, s) => acc + s.taken, 0);
  const currentRightPayment = statement.payments.right.filter(p => p.to === right.id);

  const maxPerIncome = unique(currentRightPayment.map(r => r.incomeIds).flat())
    .map(incomeId => incomes.find(i => i.id === incomeId))
    .map(income => ({
      income,
      max: getIncomingAmount(right.id, income.id, state.transfers),
      current: getCalculatedAmount(right.id, income.id, state.transfers),
      source: sources.find(s => s.id === income.sourceId)
    })).filter(i => i.max > 0);

  return {
    name: right.name,
    percent: right.percent,
    taken,
    type: 'right',
    right,
    maxPerIncome
  };
}

@Component({
  selector: 'waterfall-statement-producer-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementProducerSummaryComponent implements OnInit, OnChanges, OnDestroy {

  @Input() public statement: Statement;
  @Input() public form: StatementForm;

  private sub: Subscription;

  public statementsControl = new FormControl<string[]>([]);
  public incomeIds$ = new BehaviorSubject<string[]>([]);
  private incomes: Income[] = [];
  private statementDuplicates: Statement[] = [];

  public sources$ = combineLatest([this.incomeIds$, this.shell.incomes$, this.shell.rights$, this.shell.simulation$]).pipe(
    map(([incomeIds, incomes, rights, simulation]) => getStatementSources({ ...this.statement, incomeIds }, this.waterfall.sources, incomes, rights, simulation.waterfall.state)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private statement$ = combineLatest([
    this.incomeIds$, this.sources$, this.shell.incomes$,
    this.shell.rights$, this.shell.simulation$
  ]).pipe(
    map(([incomeIds, sources, _incomes, _rights, simulation]) => {
      if (this.statement.status === 'reported') {
        const incomes = _incomes.filter(i => this.statement.incomeIds.includes(i.id));
        this.form.setAllValue({ ...this.statement, incomes, sources });
        return this.statement;
      }

      // Update statement incomeIds given the selected incoming distributor or direct sales statements
      const incomes = incomeIds
        .map(id => _incomes.find(i => i.id === id))
        .filter(i => sources.map(s => s.id).includes(i.sourceId));

      this.statement.incomeIds = incomes.map(i => i.id);


      const statementRights = getStatementRights(this.statement, _rights);
      const rightIds = unique(sources.map(s => getAssociatedRights(s.id, statementRights, simulation.waterfall.state)).flat().map(r => r.id));
      const rights = statementRights.filter(r => rightIds.includes(r.id));

      if (this.statement.status === 'draft') {
        // Reset payments
        this.statement.payments.right = [];
        delete this.statement.payments.rightholder;
      }

      const statement = generatePayments(this.statement, simulation.waterfall.state, rights, incomes);
      if (!this.form.pristine) statement.duration = this.form.get('duration').value as Duration;
      this.form.setAllValue({ ...statement, incomes, sources });
      return statement;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public groupsBreakdown$ = combineLatest([
    this.statement$, this.shell.rights$, this.shell.incomes$,
    this.shell.simulation$, this.sources$
  ]).pipe(
    map(([statement, rights, incomes, simulation, sources]) => {
      if (statement.status === 'reported' && statement.reportedData.groupsBreakdown) return statement.reportedData.groupsBreakdown;
      const displayedRights = getStatementRightsToDisplay(statement, rights);
      const orderedRights = getOrderedRights(displayedRights, simulation.waterfall.state);
      const statementIncomes = incomes.filter(i => statement.incomeIds.includes(i.id));

      const groups: Record<string, { group: Right, rights: Right[], rows: BreakdownRow[] }> = {};
      for (const right of orderedRights) {
        const groupState = getGroup(simulation.waterfall.state, right.id);
        if (groupState && isVerticalGroup(simulation.waterfall.state, groupState)) {
          const group = rights.find(r => r.id === groupState.id);
          if (!groups[group.id]) {
            // Sources remains 
            const rows = getRightTurnover(statement.incomeIds, simulation.waterfall.state, group, sources, statementIncomes, statement.status, this.shell.versionId$.value);

            const remainTotal = rows.reduce((acc, s) => acc + s.taken, 0);

            // Total
            rows.push({ name: 'TOTAL', taken: remainTotal, type: 'total' });

            // Rights details
            const childs = getChildRights(simulation.waterfall.state, groupState); // All ChildRights are from the same org
            for (const child of childs) {
              const row = getRightTaken(rights, statement, simulation.waterfall.state, child.id, sources, incomes);
              rows.push(row);
            }

            groups[group.id] = { group, rights: [], rows };
          }
          groups[group.id].rights.push(right);
        } else {
          // Sources remains 
          const rows = getRightTurnover(statement.incomeIds, simulation.waterfall.state, right, sources, statementIncomes, statement.status, this.shell.versionId$.value);

          const remainTotal = rows.reduce((acc, s) => acc + s.taken, 0);

          // Total
          rows.push({ name: 'TOTAL', taken: remainTotal, type: 'total' });

          // Right details
          const row = getRightTaken(rights, statement, simulation.waterfall.state, right.id, sources, incomes);
          rows.push(row);

          groups[right.id] = { group: right, rights: [right], rows };
        }
      }

      return Object.values(groups).filter(g => g.rows.filter(r => r.type === 'source').length) as GroupsBreakdown[];
    }),
    tap(async groupsBreakdown => {
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.groupsBreakdown) {
        this.statement.reportedData.groupsBreakdown = groupsBreakdown;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.groupsBreakdown) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public details$ = combineLatest([
    this.groupsBreakdown$, this.shell.simulation$,
    this.statement$, this.shell.rights$
  ]).pipe(
    map(([groups, simulation, statement, rights]) => {
      if (statement.status === 'reported' && statement.reportedData.details) return statement.reportedData.details;
      const sourcesDetails = groups.map(g => g.rows.filter(r => r.type === 'source')).flat();

      const items: DetailsRow[] = [];
      for (const row of sourcesDetails) {
        const source = this.waterfall.sources.find(s => s.id === row.source.id);
        const path = getPath(row.right.id, row.source.id, simulation.waterfall.state);

        const rightId = path[path.indexOf(row.right.id) - 1];
        const details = getPathDetails(statement.incomeIds, rightId, row.source.id, simulation.waterfall.state);
        const item: DetailsRow = {
          name: source.name,
          details: details.map(d => ({
            ...d,
            from: isSource(simulation.waterfall.state, d.from) ? this.waterfall.sources.find(s => s.id === d.from.id).name : rights.find(r => r.id === d.from.id).name,
            to: rights.find(r => r.id === d.to.id).name,
            fromId: d.from.id
          }))
        }

        // Prevent duplicated rows
        const rowExists = (r: DetailsRow) => items.some(i =>
          i.name === r.name && i.details.length === r.details.length &&
          i.details[i.details.length - 1].to === r.details[r.details.length - 1].to
        );
        if (!rowExists(item)) items.push(item);
      }

      return items;
    }),
    tap(async details => {
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.details) {
        this.statement.reportedData.details = details;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.details) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public expenses$: Observable<(Expense & { cap?: PricePerCurrency })[]> = combineLatest([
    this.statement$, this.shell.statements$,
    this.shell.expenses$, this.shell.versionId$
  ]).pipe(
    map(([statement, statements, expenses, versionId]) => {
      if (statement.status === 'reported' && statement.reportedData.expenses) return statement.reportedData.expenses;
      const parentStatements = statements.filter(s => isDirectSalesStatement(s) || isDistributorStatement(s))
        .filter(s => s.payments.right.some(r => r.incomeIds.some(id => statement.incomeIds.includes(id))));
      const expenseIds = parentStatements.map(s => s.expenseIds).flat();
      return expenses.filter(e => expenseIds.includes(e.id)).map(e => {
        const type = e.typeId ? this.waterfall.expenseTypes[e.contractId].find(t => t.id === e.typeId) : undefined;
        if (!type) return e;
        const versionKey = isDefaultVersion(this.shell.waterfall, versionId) ? 'default' : versionId;
        const cap = type.cap.version[versionKey] !== undefined ? type.cap.version[versionKey] : type.cap.default;
        if (cap === 0) return e;
        return { ...e, cap: { [type.currency]: cap } };
      }).filter(e => statement.status === 'reported' ? !e.version[statement.versionId]?.hidden : true);
    }),
    tap(async expenses => {
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.expenses) {
        this.statement.reportedData.expenses = expenses;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.expenses) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public interests$ = combineLatest([this.shell.rights$, this.shell.simulation$]).pipe(
    map(([_rights, state]) => {
      if (this.statement.status === 'reported' && this.statement.reportedData.interests) return this.statement.reportedData.interests;
      const rights = getStatementRightsToDisplay(this.statement, _rights);
      const allConditions = rights.map(right => getRightCondition(right)).filter(condition => !!condition).flat();
      const interestCondition = allConditions.find(condition => condition.name === 'interest');
      if (!interestCondition) return;
      const payload = interestCondition.payload as ConditionInterest;
      return interestDetail(this.statement.contractId, payload, state.waterfall.state);
    }),
    tap(async interests => {
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.interests) {
        this.statement.reportedData.interests = interests;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.interests) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );


  public waterfall = this.shell.waterfall;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dialog: MatDialog,
    private statementService: StatementService,
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
  ) { }

  async ngOnInit() {
    this.incomeIds$.next(this.statement.incomeIds);

    this.sub = this.form.get('duration').get('to').valueChanges.pipe(debounceTime(500)).subscribe(date => {
      const control = this.form.get('duration').get('to');
      const inError = control.hasError('startOverEnd') || control.hasError('isBefore');
      if (!inError && this.shell.setDate(date)) this.shell.simulateWaterfall();
    });

    this.incomes = await this.shell.incomes(undefined, '');
    const allStatements = await this.shell.statements('');
    this.statementDuplicates = allStatements.filter(s => !!s.duplicatedFrom);
  }

  ngOnChanges() {
    this.incomeIds$.next(this.statement.incomeIds);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  public canEditRightPayment(row: BreakdownRow, statement: Statement) {
    if (statement.status === 'reported') return false;
    if (row.maxPerIncome.every(i => i.max === 0)) return false;
    if (isStandaloneVersion(this.shell.waterfall, this.shell.versionId$.value)) return false;
    if (this.shell.versionId$.value !== getDefaultVersionId(this.shell.waterfall)) return false;
    const incomeIds = row.maxPerIncome.map(i => i.income.id);
    if (statement.rightOverrides.find(c => c.rightId !== row.right.id && incomeIds.includes(c.incomeId))) return false;
    return true;
  }

  public canEditIncome(sourceId: string, statement: Statement) {
    if (statement.status === 'reported') return false;
    if (this.shell.versionId$.value === getDefaultVersionId(this.shell.waterfall)) return false;
    if (statement.rightOverrides.length) return false;
    if (isStandaloneVersion(this.shell.waterfall, this.shell.versionId$.value)) return false;
    const incomes = this.incomes.filter(i => i.sourceId === sourceId && this.incomeIds$.value.includes(i.id));
    const currentVersionDuplicates = this.statementDuplicates.filter(s => s.versionId === this.shell.versionId$.value);
    if (currentVersionDuplicates.some(s => incomes.some(i => s.incomeIds.includes(i.id)))) return false;
    return true;
  }

  public canEditExpense(expenseId: string, statement: Statement) {
    if (statement.status === 'reported') return false;
    if (this.shell.versionId$.value === getDefaultVersionId(this.shell.waterfall)) return false;
    if (statement.rightOverrides.length) return false;
    if (isStandaloneVersion(this.shell.waterfall, this.shell.versionId$.value)) return false;
    const currentVersionDuplicates = this.statementDuplicates.filter(s => s.versionId === this.shell.versionId$.value);
    if (currentVersionDuplicates.some(s => s.expenseIds.includes(expenseId))) return false;
    return true;
  }

  public async editRightPayment(row: BreakdownRow, statement: Statement) {
    const statements = await this.shell.statements();
    this.dialog.open(StatementArbitraryChangeComponent, {
      data: createModalData({
        right: row.right,
        maxPerIncome: row.maxPerIncome,
        overrides: statement.rightOverrides.filter(c => c.rightId === row.right.id),
        statementId: statement.id,
        statements,
        waterfall: this.waterfall,
        onConfirm: async (overrides: RightOverride[]) => {
          const rightOverrides = statement.rightOverrides.filter(c => c.rightId !== row.right.id);

          await this.statementService.update(statement.id, {
            rightOverrides: [...rightOverrides, ...overrides],
            incomeIds: this.statement.incomeIds
          }, { params: { waterfallId: this.waterfall.id } });

          // Refresh simulation
          await this.shell.simulateWaterfall();
        }
      })
    });
  }

  public editIncome(sourceId: string) {
    const incomes = this.incomes.filter(i => i.sourceId === sourceId && this.incomeIds$.value.includes(i.id));
    this.dialog.open(StatementIncomeEditComponent, {
      data: createModalData({
        incomes,
        waterfall: this.shell.waterfall,
        versionId: this.shell.versionId$.value,
        onConfirm: async (incomes: Income[]) => {
          await this.incomeService.update(incomes);

          // Refresh simulation
          await this.shell.simulateWaterfall();
        }
      })
    });
  }

  public async editExpense(expenseId: string) {
    const expense = await this.expenseService.getValue(expenseId);
    this.dialog.open(StatementExpenseEditComponent, {
      data: createModalData({
        expense,
        waterfall: this.shell.waterfall,
        versionId: this.shell.versionId$.value,
        onConfirm: async (expense: Expense) => {
          await this.expenseService.update(expense);

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