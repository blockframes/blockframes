import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, tap } from 'rxjs';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import {
  Condition,
  MgStatus,
  Right,
  RightsBreakdown,
  SourcesBreakdown,
  getExpensesValue,
  sortStatements,
  sum
} from '@blockframes/model';
import { MatTabGroup } from '@angular/material/tabs';

interface Information {
  right: Right;
  rightholderId: string;
  orgRevenue: number;
  bonus?: number;
  rightRevenue: number;
  expenses?: number;
  cappedExpenses?: number;
  expensesToBeRecouped?: number;
  mgStatus?: MgStatus;
}
// TODO #9896 review this component as steps cannot be selected anymore
@Component({
  selector: 'waterfall-graph-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphNodeDetailsComponent implements OnInit {
  @Input() public steps: Condition[][];
  @Input() private rightId$: BehaviorSubject<string>;

  public information$: Observable<Information>;
  public waterfall = this.shell.waterfall;

  @ViewChild('tabs', { static: true }) tabs?: MatTabGroup;

  constructor(private shell: DashboardWaterfallShellComponent) { }

  ngOnInit() {
    const right$ = combineLatest([this.rightId$, this.shell.rights$]).pipe(
      map(([id, rights]) => rights.find(r => r.id === id)),
      tap(r => { if (this.tabs && r?.type === 'vertical') this.tabs.selectedIndex = 1; })
    );

    const statements$ = this.shell.rightholderStatements$.pipe(
      map(statements => statements.filter(s => s.status === 'reported' && (!s.reviewStatus || s.reviewStatus === 'accepted'))),
      map(statements => sortStatements(statements))
    );

    this.information$ = combineLatest([
      right$,
      this.shell.state$,
      this.shell.rights$,
      this.shell.revenueMode$,
      statements$
    ]).pipe(
      map(([right, state, rights, revenueMode, _statements]) => {
        if (!right) return;
        const data: Information = {
          right: { ...right },
          rightholderId: '',
          orgRevenue: 0,
          rightRevenue: state.waterfall.state.rights[right.id]?.revenu[revenueMode]
        };

        if (right.type === 'vertical') {
          data.rightRevenue = state.waterfall.state.verticals[right.id]?.revenu[revenueMode];
          right = rights.find(r => r.groupId === right.id);
        }

        const orgState = state.waterfall.state.orgs[right.rightholderId];
        if (!orgState) return;
        data.orgRevenue = orgState.revenu[revenueMode];
        data.rightholderId = right.rightholderId;

        const expenseState = Object.values(state.waterfall.state.expenses).filter(e => e.orgId === orgState.id);
        const cappedExpenses = getExpensesValue(state.waterfall.state, expenseState);

        if (revenueMode === 'calculated') data.bonus = orgState.bonus;

        // Get last statement about this right
        const stateDate = new Date(state.waterfall.state.date);
        const statements = _statements.filter(s => s.duration.to.getTime() <= stateDate.getTime());
        const statement = statements.find(s =>
          s.reportedData.sourcesBreakdown?.some(b => b.rows.some(r => r.right?.id === right.id)) ||
          s.reportedData.rightsBreakdown?.some(b => b.rows.some(r => r.right?.id === right.id))
        );

        if (statement?.reportedData && statement.type !== 'producer') {
          const { distributorExpenses = [], sourcesBreakdown, rightsBreakdown } = statement.reportedData;

          const hasRight = (b: SourcesBreakdown | RightsBreakdown) => b.rows.some(r => r.right?.id === right.id);
          const breakdown = sourcesBreakdown.find(hasRight) || rightsBreakdown.find(hasRight);
          if (right.type === 'expenses') {
            const expensesByType = distributorExpenses.map(e => e.rows)?.flat();
            data.expenses = expensesByType ? sum(expensesByType, e => e.cumulated) : undefined;
            if (data.expenses && data.expenses !== cappedExpenses) data.cappedExpenses = cappedExpenses;
            if (breakdown.stillToBeRecouped) data.expensesToBeRecouped = breakdown.stillToBeRecouped;
          } else if (right.type === 'mg' && breakdown.mgStatus) {
            data.mgStatus = breakdown.mgStatus;
          }
        }

        return data;
      })
    )
  }
}