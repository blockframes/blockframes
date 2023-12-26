import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Duration,
  Income,
  Right,
  RightOverride,
  Statement,
  TitleState,
  WaterfallSource,
  generatePayments,
  getAssociatedRights,
  getAssociatedSource,
  getCalculatedAmount,
  getChildRights,
  getGroup,
  getIncomingAmount,
  getOrderedRights,
  getPath,
  getPathDetails,
  getSources,
  getStatementRights,
  getStatementRightsToDisplay,
  getStatementSources,
  getTransferDetails,
  isSource,
  isVerticalGroup
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../form/statement.form';
import { BehaviorSubject, Subscription, combineLatest, debounceTime, map, shareReplay } from 'rxjs';
import { unique } from '@blockframes/utils/helpers';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { StatementArbitraryChangeComponent } from '../../statement-arbitrary-change/statement-arbitrary-change.component';
import { StatementService } from '@blockframes/waterfall/statement.service';

function getSourcesWithRemainsOf(incomeIds: string[], state: TitleState, right: Right, sources: WaterfallSource[]): BreakdownRow[] {
  const sourceIds = getSources(state, right.id).map(i => i.id);

  return sources.filter(s => sourceIds.includes(s.id)).map(s => {
    const path = getPath(right.id, s.id, state);

    // We want the value of the transfer that is just before the current right or group
    const from = path[path.indexOf(right.id) - 2];
    const to = path[path.indexOf(right.id) - 1];

    const details = getTransferDetails(incomeIds, s.id, from, to, state);
    return { ...s, taken: details.taken };
  }).map(source => ({ name: source.name, taken: source.taken, type: 'source', source, right }));
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

  const maxPerIncome = unique(currentRightPayment.map(r => r.incomeIds).flat()).map(incomeId => ({
    income: incomes.find(i => i.id === incomeId),
    max: getIncomingAmount(right.id, incomeId, state.transfers),
    current: getCalculatedAmount(right.id, incomeId, state.transfers),
    source: getAssociatedSource(incomes.find(i => i.id === incomeId), sources)
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

interface BreakdownRow {
  name: string;
  percent?: number;
  taken: number;
  type?: 'source' | 'total' | 'right';
  right?: Right;
  source?: WaterfallSource & { taken: number };
  maxPerIncome?: {
    income: Income;
    max: number;
    current: number;
    source: WaterfallSource
  }[];
}

@Component({
  selector: 'waterfall-statement-producer-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementProducerSummaryComponent implements OnInit, OnDestroy {

  @Input() public statement: Statement;
  @Input() public form: StatementForm;

  private sub: Subscription;

  public statementsControl = new FormControl<string[]>([]);
  public incomeIds$ = new BehaviorSubject<string[]>([]);

  public sources$ = combineLatest([this.incomeIds$, this.shell.incomes$, this.shell.rights$, this.shell.simulation$]).pipe(
    map(([incomeIds, incomes, rights, simulation]) => getStatementSources({ ...this.statement, incomeIds }, this.waterfall.sources, incomes, rights, simulation.waterfall.state)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private statement$ = combineLatest([
    this.incomeIds$, this.sources$, this.shell.incomes$,
    this.shell.rights$, this.shell.simulation$
  ]).pipe(
    map(([incomeIds, sources, _incomes, _rights, simulation]) => {

      // Update statement incomeIds given the selected incoming distibutor or direct sales statements
      const incomes = incomeIds
        .map(id => _incomes.find(i => i.id === id))
        .filter(i => sources.map(s => s.id).includes(getAssociatedSource(i, this.waterfall.sources).id));

      this.statement.incomeIds = incomes.map(i => i.id);

      // Reset payments
      this.statement.payments.right = [];
      delete this.statement.payments.rightholder;

      const statementRights = getStatementRights(this.statement, _rights);
      const rightIds = unique(sources.map(s => getAssociatedRights(s.id, statementRights, simulation.waterfall.state)).flat().map(r => r.id));
      const rights = statementRights.filter(r => rightIds.includes(r.id));

      if (this.statement.status === 'draft') {
        // Reset payments
        this.statement.payments.right = [];
        delete this.statement.payments.rightholder;
      }

      const statement = generatePayments(this.statement, simulation.waterfall.state, rights, incomes, sources);
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

      const displayedRights = getStatementRightsToDisplay(statement, rights);
      const orderedRights = getOrderedRights(displayedRights, simulation.waterfall.state);

      const groups: Record<string, { group: Right, rights: Right[], rows: BreakdownRow[] }> = {};
      for (const right of orderedRights) {
        const groupState = getGroup(simulation.waterfall.state, right.id);
        if (groupState && isVerticalGroup(simulation.waterfall.state, groupState)) {
          const group = rights.find(r => r.id === groupState.id);
          if (!groups[group.id]) {
            // Sources remains 
            const rows = getSourcesWithRemainsOf(statement.incomeIds, simulation.waterfall.state, group, sources);

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
          const rows = getSourcesWithRemainsOf(statement.incomeIds, simulation.waterfall.state, right, sources);

          const remainTotal = rows.reduce((acc, s) => acc + s.taken, 0);

          // Total
          rows.push({ name: 'TOTAL', taken: remainTotal, type: 'total' });

          // Right details
          const row = getRightTaken(rights, statement, simulation.waterfall.state, right.id, sources, incomes);
          rows.push(row);

          groups[right.id] = { group: right, rights: [right], rows };
        }
      }

      return Object.values(groups).filter(g => g.rows.filter(r => r.type === 'source').length);
    })
  );

  public details$ = combineLatest([
    this.groupsBreakdown$, this.shell.simulation$,
    this.statement$, this.shell.rights$
  ]).pipe(
    map(([groups, simulation, statement, rights]) => {
      const sourcesDetails = groups.map(g => g.rows.filter(r => r.type === 'source')).flat();

      return sourcesDetails.map(row => {
        const source = this.waterfall.sources.find(s => s.id === row.source.id);
        const path = getPath(row.right.id, row.source.id, simulation.waterfall.state);

        const rightId = path[path.indexOf(row.right.id) - 1];
        const details = getPathDetails(statement.incomeIds, rightId, row.source.id, simulation.waterfall.state);
        return {
          name: source.name,
          details: details.map(d => ({
            ...d,
            from: isSource(simulation.waterfall.state, d.from) ? this.waterfall.sources.find(s => s.id === d.from.id).name : rights.find(r => r.id === d.from.id).name,
            to: rights.find(r => r.id === d.to.id).name
          }))
        }
      });
    })
  );

  private waterfall = this.shell.waterfall;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dialog: MatDialog,
    private statementService: StatementService
  ) { }

  ngOnInit() {
    this.incomeIds$.next(this.statement.incomeIds);

    this.sub = this.form.get('duration').get('to').valueChanges.pipe(debounceTime(500)).subscribe(date => {
      const control = this.form.get('duration').get('to');
      const inError = control.hasError('startOverEnd') || control.hasError('isBefore');
      if (!inError && this.shell.setDate(date)) this.shell.simulateWaterfall();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  public canEditRightPayment(row: BreakdownRow, statement: Statement) {
    if (statement.status === 'reported') return false;
    if (row.maxPerIncome.every(i => i.max === 0)) return false;
    const incomeIds = row.maxPerIncome.map(i => i.income.id);
    if (statement.rightOverrides.find(c => c.rightId !== row.right.id && incomeIds.includes(c.incomeId))) return false;
    return true;
  }

  public editRightPayment(row: BreakdownRow, statement: Statement) {
    this.dialog.open(StatementArbitraryChangeComponent, {
      data: createModalData({
        right: row.right,
        maxPerIncome: row.maxPerIncome,
        overrides: statement.rightOverrides.filter(c => c.rightId === row.right.id),
        onConfirm: async (overrides: RightOverride[]) => {
          const rightOverrides = statement.rightOverrides.filter(c => c.rightId !== row.right.id);

          // TODO #9520 if statement is using incomeIds declared in directSales statements, we should update the directSales statements and display a warning
          // TODO #9520 also, if max > 100% we should display a warning + max and theoric max should be displayed in the UI

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