import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  BreakdownRow,
  ConditionInterest,
  OutgoingDetails,
  Duration,
  Expense,
  OutgoingBreakdown,
  Income,
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
  isSource,
  isStandaloneVersion,
  isVerticalGroup,
  interestDetail,
  canOnlyReadStatements,
  skipSourcesWithAllHiddenIncomes,
  filterStatements,
  sortStatements,
  getExpensesHistory,
  sortByDate,
  getDistributorExpensesDetails,
  DistributorExpenses,
  getParentStatements,
  AmortizationDetails,
  MaxPerIncome,
  sum
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../../form/statement.form';
import { BehaviorSubject, Observable, Subscription, combineLatest, debounceTime, map, shareReplay, tap } from 'rxjs';
import { unique } from '@blockframes/utils/helpers';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { StatementArbitraryChangeComponent } from '../../statement-arbitrary-change/statement-arbitrary-change.component';
import { StatementService } from '../../../../statement.service';
import { StatementIncomeEditComponent } from '../../statement-income-edit/statement-income-edit.component';
import { IncomeService } from '@blockframes/contract/income/service';
import { StatementExpenseEditComponent } from '../../statement-expense-edit/statement-expense-edit.component';
import { ExpenseService } from '@blockframes/contract/expense/service';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Returns the amount that arrived to a given right for :
 * - current incomeIds (current statement)
 * - previous incomeIds (previous statements)
 * @param incomeIds 
 * @param previousIncomeIds 
 * @param state 
 * @param right 
 * @param sources 
 * @param filterOptions
 * @returns 
 */
function getRightTurnover(
  incomeIds: string[],
  previousIncomeIds: string[],
  state: TitleState,
  right: Right,
  sources: WaterfallSource[],
  filterOptions: { statementIncomes: Income[], statementStatus: StatementStatus, versionId: string }
): BreakdownRow[] {
  const sourceIds = getSources(state, right.id).map(i => i.id);

  return sources.filter(s => sourceIds.includes(s.id)).map(source => {
    const path = getPath(right.id, source.id, state);

    const to = path[path.length - 1];
    const from = path[path.indexOf(to) - 1];
    const transfers = {
      current: getTransferDetails(incomeIds, source.id, from, to, state).max,
      previous: getTransferDetails(previousIncomeIds, source.id, from, to, state).max,
      cumulated: getTransferDetails([...incomeIds, ...previousIncomeIds], source.id, from, to, state).max
    }

    return { source, transfers };
  }).map(details => ({
    section: details.source.name,
    ...details.transfers,
    type: 'source',
    source: details.source,
    right
  } as BreakdownRow))
    .filter(row => {
      if (filterOptions.statementStatus === 'draft') return true;
      // Remove sources where all incomes are hidden from reported statement 
      const sourceIncomes = filterOptions.statementIncomes.filter(i => i.sourceId === row.source.id);
      const allHidden = sourceIncomes.every(i => i.version[filterOptions.versionId]?.hidden);
      return !allHidden;
    })
}

/**
 * Return the maximum amount that can be taken by a right for a given income (used for right overrides)
 * @param statement 
 * @param right 
 * @param state 
 * @param incomes 
 * @param sources 
 * @returns 
 */
function getMaxPerIncome(statement: Statement, right: Right, state: TitleState, incomes: Income[], sources: WaterfallSource[]): MaxPerIncome[] {
  const currentRightPayment = statement.payments.right.filter(p => p.to === right.id);
  return unique(currentRightPayment.map(r => r.incomeIds).flat())
    .map(incomeId => incomes.find(i => i.id === incomeId))
    .map(income => ({
      income,
      max: getIncomingAmount(right.id, income.id, state.transfers),
      current: getCalculatedAmount(right.id, income.id, state.transfers, { rounded: true }),
      source: sources.find(s => s.id === income.sourceId)
    })).filter(i => i.max > 0);
}

function getRightTaken(rights: Right[], statement: Statement, previousIncomeIds: string[], state: TitleState, rightId: string, sources: WaterfallSource[], incomes: Income[]): BreakdownRow {
  const right = rights.find(r => r.id === rightId);
  const sourceIds = getSources(state, rightId).map(i => i.id);

  const details = sources.filter(s => sourceIds.includes(s.id)).map(s => {
    const path = getPath(rightId, s.id, state);

    const to = path[path.length - 1];
    const from = path[path.indexOf(to) - 1];
    return {
      current: getTransferDetails(statement.incomeIds, s.id, from, to, state).taken,
      previous: getTransferDetails(previousIncomeIds.flat(), s.id, from, to, state).taken,
      cumulated: getTransferDetails([...statement.incomeIds, ...previousIncomeIds], s.id, from, to, state).taken
    }
  });

  return {
    section: right.name,
    current: details.reduce((acc, s) => acc + s.current, 0),
    previous: details.reduce((acc, s) => acc + s.previous, 0),
    cumulated: details.reduce((acc, s) => acc + s.cumulated, 0),
    type: 'right',
    right,
    maxPerIncome: getMaxPerIncome(statement, right, state, incomes, sources)
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
  private readonly = canOnlyReadStatements(this.shell.currentRightholder, this.shell.canBypassRules);
  private devMode = false;
  public i18nStrings = {
    cannotEdit: $localize`This cannot be edited.`,
    changeIncome: $localize`Change Income value`,
    changeExpense: $localize`Change Expense value`,
    changeCurrent: $localize`Change current value`,
    yes: $localize`Yes`,
    no: $localize`No`
  };

  private sources$ = combineLatest([this.incomeIds$, this.shell.incomes$, this.shell.rights$, this.shell.simulation$]).pipe(
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

  private previousStatements$ = combineLatest([this.statement$, this.shell.statements$]).pipe(
    map(([statement, statements]) => {
      const filteredStatements = filterStatements(statement.type, [statement.senderId, statement.receiverId], statement.contractId, statements);
      const sortedStatements = sortStatements(filteredStatements);
      const current = sortedStatements.find(s => s.id === statement.id);
      return sortedStatements.filter(s => s.number < current.number);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private previousIncomeIds$ = this.previousStatements$.pipe(
    map(statements => Array.from(new Set(statements.map(s => s.incomeIds).flat()))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public cleanSources$ = combineLatest([this.statement$, this.sources$, this.shell.incomes$]).pipe(
    map(([statement, sources, incomes]) => skipSourcesWithAllHiddenIncomes(statement, sources, incomes)),
  );

  public outgoingBreakdown$ = combineLatest([
    this.statement$, this.shell.rights$, this.shell.incomes$,
    this.shell.simulation$, this.sources$, this.previousIncomeIds$
  ]).pipe(
    map(([statement, rights, incomes, simulation, sources, previousIncomeIds]) => {
      if (!this.devMode && statement.status === 'reported' && statement.reportedData.outgoingBreakdown) return statement.reportedData.outgoingBreakdown;
      const displayedRights = getStatementRightsToDisplay(statement, rights);
      const orderedRights = getOrderedRights(displayedRights, simulation.waterfall.state);
      const statementIncomes = incomes.filter(i => statement.incomeIds.includes(i.id));
      const filterOptions = { statementIncomes, statementStatus: statement.status, versionId: this.shell.versionId$.value };

      const groups: Record<string, { group: Right, rights: Right[], rows: BreakdownRow[] }> = {};
      for (const right of orderedRights) {
        const groupState = getGroup(simulation.waterfall.state, right.id);
        if (groupState && isVerticalGroup(simulation.waterfall.state, groupState)) {
          const group = rights.find(r => r.id === groupState.id);
          if (!groups[group.id]) {
            // Sources remains 
            const rows = getRightTurnover(statement.incomeIds, previousIncomeIds, simulation.waterfall.state, group, sources, filterOptions);

            const total = {
              current: rows.reduce((acc, s) => acc + s.current, 0),
              previous: rows.reduce((acc, s) => acc + s.previous, 0),
              cumulated: rows.reduce((acc, s) => acc + s.cumulated, 0)
            }

            // Total
            rows.push({ section: 'TOTAL', ...total, type: 'total' });

            // Rights details
            const childs = getChildRights(simulation.waterfall.state, groupState); // All ChildRights are from the same org
            for (const child of childs) {
              const row = getRightTaken(rights, statement, previousIncomeIds, simulation.waterfall.state, child.id, sources, incomes);
              rows.push(row);
            }

            groups[group.id] = { group, rights: [], rows };
          }
          groups[group.id].rights.push(right);
        } else {
          // Sources remains 
          const rows = getRightTurnover(statement.incomeIds, previousIncomeIds, simulation.waterfall.state, right, sources, filterOptions);

          const total = {
            current: rows.reduce((acc, s) => acc + s.current, 0),
            previous: rows.reduce((acc, s) => acc + s.previous, 0),
            cumulated: rows.reduce((acc, s) => acc + s.cumulated, 0)
          }

          // Total
          rows.push({ section: 'TOTAL', ...total, type: 'total' });

          // Right details
          const row = getRightTaken(rights, statement, previousIncomeIds, simulation.waterfall.state, right.id, sources, incomes);
          rows.push(row);

          groups[right.id] = { group: right, rights: [right], rows };
        }
      }

      return Object.values(groups).filter(g => g.rows.filter(r => r.type === 'source').length) as OutgoingBreakdown[];
    }),
    tap(async outgoingBreakdown => {
      if (this.readonly || (this.statement.versionId !== this.shell.versionId$.value)) return;
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.outgoingBreakdown) {
        this.statement.reportedData.outgoingBreakdown = outgoingBreakdown;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.outgoingBreakdown) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public outgoingDetails$ = combineLatest([
    this.outgoingBreakdown$, this.shell.simulation$,
    this.statement$, this.shell.rights$, this.previousIncomeIds$
  ]).pipe(
    map(([groups, simulation, statement, rights, previousIncomeIds]) => {
      if (!this.devMode && statement.status === 'reported' && statement.reportedData.outgoingDetails) return statement.reportedData.outgoingDetails;
      const sourcesDetails = groups.map(g => g.rows.filter(r => r.type === 'source')).flat();
      const pathDetailsOptions = { showChildsDetails: true, skipEmptyTransfers: true };

      const items: OutgoingDetails[] = [];
      for (const row of sourcesDetails) {
        const source = this.waterfall.sources.find(s => s.id === row.source.id);
        const path = getPath(row.right.id, row.source.id, simulation.waterfall.state);

        const sourceDetails = {
          node: source.name,
          sourceId: source.id,
          current: getTransferDetails(statement.incomeIds, row.source.id, path[0], path[1], simulation.waterfall.state).max,
          previous: getTransferDetails(previousIncomeIds, row.source.id, path[0], path[1], simulation.waterfall.state).max,
          cumulated: getTransferDetails([...statement.incomeIds, ...previousIncomeIds], row.source.id, path[0], path[1], simulation.waterfall.state).max,
        };

        const rightId = path[path.indexOf(row.right.id) - 1];

        const pathDetails = getPathDetails(statement.incomeIds, previousIncomeIds, rightId, row.source.id, simulation.waterfall.state, pathDetailsOptions)
          .map(d => ({
            ...d,
            node: rights.find(r => r.id === d.to.id).name,
          }))
          // Remove rows already displayed in the source details and its brothers
          .filter(d => ![row.right.id, row.right.groupId].includes(d.to.id) && row.right.groupId !== d.rootGroupId);

        const net = sourceDetails.current - sum(pathDetails, (d => d.current));
        const item: OutgoingDetails = {
          name: source.name,
          net,
          details: [sourceDetails, ...pathDetails]
        };

        // Prevent duplicated rows
        const rowExists = (r: OutgoingDetails) => items.some(i =>
          i.name === r.name && i.details.length === r.details.length &&
          i.details[i.details.length - 1].node === r.details[r.details.length - 1].node
        );
        if (!rowExists(item)) items.push(item);
      }

      return items;
    }),
    tap(async details => {
      if (this.readonly || (this.statement.versionId !== this.shell.versionId$.value)) return;
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.outgoingDetails) {
        this.statement.reportedData.outgoingDetails = details;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.outgoingDetails) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public expensesHistory$ = combineLatest([
    this.statement$, this.shell.statements$, this.shell.expenses$, this.sources$,
    this.shell.rights$, this.shell.simulation$, this.shell.incomes$, this.shell.versionId$
  ]).pipe(
    map(([statement, statements, expenses, declaredSources, rights, simulation, incomes, versionId]) => {
      if (!this.devMode && statement.status === 'reported' && statement.reportedData.expensesPerDistributor) return statement.reportedData.expensesPerDistributor;
      const parentStatements = getParentStatements(statements, statement.incomeIds);

      const expensesHistory: Record<string, (Expense & { cap?: number, editable: boolean })[]> = {};
      for (const parentStatement of parentStatements) {
        const _statementHistory = filterStatements(parentStatement.type, [parentStatement.senderId, parentStatement.receiverId], parentStatement.contractId, statements);
        const statementHistory = sortStatements(_statementHistory);

        const history: (Expense & { cap?: number })[] = getExpensesHistory(parentStatement, statementHistory, expenses, declaredSources, rights, simulation.waterfall.state, incomes, versionId, statement.status !== 'reported')
          .map(e => {
            const type = e.typeId ? this.waterfall.expenseTypes[e.contractId].find(t => t.id === e.typeId) : undefined;
            if (!type) return e;
            const versionKey = isDefaultVersion(this.shell.waterfall, versionId) ? 'default' : versionId;
            const cap = type.cap.version[versionKey] !== undefined ? type.cap.version[versionKey] : type.cap.default;
            if (cap === 0) return e;
            return { ...e, cap };
          });

        for (const e of history) {
          if (!expensesHistory[e.rightholderId]) expensesHistory[e.rightholderId] = [];
          if (!expensesHistory[e.rightholderId].find(h => h.id === e.id)) {
            expensesHistory[e.rightholderId].push({ ...e, editable: parentStatement.expenseIds.includes(e.id) });
          }
        }
      }

      // sort expenses by date
      for (const rightholderId in expensesHistory) {
        expensesHistory[rightholderId] = sortByDate(expensesHistory[rightholderId], 'date');
      }

      return expensesHistory;
    }),
    tap(async expensesHistory => {
      if (this.readonly || (this.statement.versionId !== this.shell.versionId$.value)) return;
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.expensesPerDistributor) {
        this.statement.reportedData.expensesPerDistributor = expensesHistory;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.expensesPerDistributor) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public expensesDetails$ = combineLatest([this.statement$, this.expensesHistory$, this.shell.statements$]).pipe(
    map(([current, history, statements]) => {
      if (!this.devMode && current.status === 'reported' && current.reportedData.distributorExpensesPerDistributor) return current.reportedData.distributorExpensesPerDistributor;

      const parentStatements = getParentStatements(statements, current.incomeIds);

      const expensesDetails: Record<string, DistributorExpenses[]> = {};
      Object.entries(history).forEach(([rightholderId, expenses]) => {
        const currentStatements = parentStatements.filter(s => s.senderId === rightholderId);
        expensesDetails[rightholderId] = getDistributorExpensesDetails(currentStatements, expenses, this.shell.waterfall);
      });

      return expensesDetails;
    }),
    tap(async expensesDetails => {
      if (this.readonly || (this.statement.versionId !== this.shell.versionId$.value)) return;
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.distributorExpensesPerDistributor) {
        this.statement.reportedData.distributorExpensesPerDistributor = expensesDetails;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.distributorExpensesPerDistributor) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public interests$ = combineLatest([this.shell.rights$, this.shell.simulation$]).pipe(
    map(([_rights, state]) => {
      if (!this.devMode && this.statement.status === 'reported' && this.statement.reportedData.interests) return this.statement.reportedData.interests;
      const rights = getStatementRightsToDisplay(this.statement, _rights);
      const allConditions = rights.map(right => getRightCondition(right)).filter(condition => !!condition).flat();
      const interestCondition = allConditions.find(condition => condition.name === 'interest');
      if (!interestCondition) return;
      const payload = interestCondition.payload as ConditionInterest;
      return interestDetail(this.statement.contractId, payload, state.waterfall.state);
    }),
    tap(async interests => {
      if (this.readonly || (this.statement.versionId !== this.shell.versionId$.value)) return;
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.interests) {
        this.statement.reportedData.interests = interests;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.interests) {
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: {} }, { params: { waterfallId: this.waterfall.id } });
      }
    })
  );

  public amortizationDetails$: Observable<AmortizationDetails> = combineLatest([this.shell.simulation$, this.shell.amortizations$]).pipe(
    map(([simulation, amortizations]) => {
      if (!this.devMode && this.statement.status === 'reported' && this.statement.reportedData.amortization) return this.statement.reportedData.amortization;
      const contractId = this.statement.contractId;
      const amortization = amortizations.find(a => a.contractIds.includes(contractId));
      if (!amortization) return undefined;
      const amortizationState = simulation.waterfall.state.amortizations[amortization.id];
      if (!amortizationState) return undefined;
      const pool = simulation.waterfall.state.pools[amortizationState.poolId];
      if (!pool) return undefined;
      const currentValue = pool.turnover.calculated;
      const rest = amortizationState.filmCost - (currentValue + amortizationState.financing);
      const restToBeAmortized = rest <= 0 ? 0 : rest;
      return { restToBeAmortized, currentValue, ...amortization };
    }),
    tap(async amortization => {
      if (this.readonly || (this.statement.versionId !== this.shell.versionId$.value)) return;
      const reportedData = this.statement.reportedData;
      if (this.statement.status === 'reported' && !reportedData.amortization) {
        this.statement.reportedData.amortization = amortization;
        await this.statementService.update(this.statement.id, { id: this.statement.id, reportedData: this.statement.reportedData }, { params: { waterfallId: this.waterfall.id } });
      } else if (this.statement.status !== 'reported' && reportedData.amortization) {
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
    private snackbar: MatSnackBar,
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
          this.snackbar.open($localize`changes applied`, 'close', { duration: 5000 });
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
          this.snackbar.open($localize`changes applied`, 'close', { duration: 5000 });
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
          this.snackbar.open($localize`changes applied`, 'close', { duration: 5000 });
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
        waterfall: this.waterfall,
      })
    });
  }
}