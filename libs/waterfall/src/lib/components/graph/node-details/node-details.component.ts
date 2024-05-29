import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { RightForm, RightFormValue } from '../../../form/right.form';
import { BehaviorSubject, Observable, combineLatest, map, startWith, tap } from 'rxjs';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import {
  MgStatus,
  PricePerCurrency,
  RightsBreakdown,
  SourcesBreakdown,
  convertCurrenciesTo,
  getExpensesValue,
  getTotalPerCurrency,
  mainCurrency,
  sortStatements
} from '@blockframes/model';
import { MatLegacyTabGroup as MatTabGroup } from '@angular/material/legacy-tabs';

interface Information {
  org: number;
  bonus?: number;
  right: number;
  expenses?: number;
  cappedExpenses?: number;
  expensesToBeRecouped?: PricePerCurrency;
  mgStatus?: MgStatus;
};

@Component({
  selector: 'waterfall-graph-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphNodeDetailsComponent implements OnInit {
  @Input() public rightForm: RightForm;
  @Input() public set rightId(id: string) { this.rightId$.next(id); };
  public get rightId() { return this.rightId$.value; }
  private rightId$ = new BehaviorSubject<string>(null);
  public rights$ = this.shell.rights$;
  public right$ = combineLatest([this.rightId$, this.rights$]).pipe(
    map(([id, rights]) => rights.find(r => r.id === id)),
    tap(r => { if (this.tabs && r?.type === 'vertical') this.tabs.selectedIndex = 1; })
  );
  public formValue$: Observable<RightFormValue>;
  public information$: Observable<Information>;

  private statements$ = this.shell.rightholderStatements$.pipe(
    map(statements => statements.filter(s => s.status === 'reported' && (!s.reviewStatus || s.reviewStatus === 'accepted'))),
    map(statements => sortStatements(statements))
  );

  @ViewChild('tabs', { static: true }) tabs?: MatTabGroup;

  constructor(
    private shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnInit() {
    this.formValue$ = this.rightForm.valueChanges.pipe(
      startWith(this.rightForm.getRawValue()),
      map(() => this.rightForm.getRawValue())
    );

    this.information$ = combineLatest([
      this.right$,
      this.shell.state$,
      this.rights$,
      this.shell.revenueMode$,
      this.statements$
    ]).pipe(
      map(([right, state, rights, revenueMode, _statements]) => {
        if (!right) return;
        let rightRevenue = state.waterfall.state.rights[right.id]?.revenu[revenueMode];

        if (right.type === 'vertical') {
          rightRevenue = state.waterfall.state.verticals[right.id]?.revenu[revenueMode];
          right = rights.find(r => r.groupId === right.id);
        }

        const orgState = state.waterfall.state.orgs[right.rightholderId];
        if (!orgState) return;
        const orgRevenue = orgState.revenu[revenueMode];

        const expenseState = Object.values(state.waterfall.state.expenses).filter(e => e.orgId === orgState.id);
        const cappedExpenses = getExpensesValue(state.waterfall.state, expenseState);

        const data: Information = { org: orgRevenue, right: rightRevenue };
        if (revenueMode === 'calculated') data.bonus = orgState.bonus;

        // Get last statement about this right
        const stateDate = new Date(state.waterfall.state.date);
        const statements = _statements.filter(s => s.duration.to.getTime() <= stateDate.getTime());
        const statement = statements.find(s =>
          s.reportedData.sourcesBreakdown?.some(b => b.rows.some(r => r.right?.id === right.id)) ||
          s.reportedData.rightsBreakdown?.some(b => b.rows.some(r => r.right?.id === right.id))
        );

        if (statement?.reportedData && statement.type !== 'producer') {
          const { distributorExpenses, sourcesBreakdown, rightsBreakdown } = statement.reportedData;

          const hasRight = (b: SourcesBreakdown | RightsBreakdown) => b.rows.some(r => r.right?.id === right.id);
          const breakdown = sourcesBreakdown.find(hasRight) || rightsBreakdown.find(hasRight);
          if (right.type === 'expenses') {
            const expensesByType = distributorExpenses.map(e => e.rows)?.flat();
            const statementExpenses = expensesByType?.map(r => ({ price: convertCurrenciesTo(r.cumulated, mainCurrency)[mainCurrency], currency: mainCurrency }));
            data.expenses = getTotalPerCurrency(statementExpenses)[mainCurrency];
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