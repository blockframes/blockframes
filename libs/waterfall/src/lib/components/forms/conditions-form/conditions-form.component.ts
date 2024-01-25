
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';

import {
  Right,
  arrayOperator,
  numberOperator,
  WaterfallContract,
  rightholderGroups,
  getDeclaredAmount,
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';

import { ConditionForm } from './condition.form';

const ownerLabels = {
  rightholder: 'Right Holder',
  revenueShare: 'Revenue Share',
  group: 'Group',
  pool: 'Pool',
};

@Component({
  selector: 'waterfall-conditions-form',
  templateUrl: './conditions-form.component.html',
  styleUrls: ['./conditions-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallConditionsFormComponent implements OnInit, OnDestroy {

  @Input() form: ConditionForm;

  public revenueOwnerLabel$ = new BehaviorSubject('Owner');
  public revenueOwnerList$ = new BehaviorSubject<{ id: string, name: string }[]>([]);
  public investments: WaterfallContract[] = [];
  public numberOperator = numberOperator;
  public arrayOperator = arrayOperator;

  private rights: Right[] = [];
  private groups: Right[] = [];
  private pools: string[] = [];

  private subs: Subscription[] = [];

  constructor(
    private shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnInit() {
    this.subs.push(
      this.shell.rights$.subscribe(rights => {
        const groupIds = new Set<string>();
        rights.forEach(right => {
          if (right.groupId) groupIds.add(right.groupId);
        });
        this.rights = rights.filter(right => !groupIds.has(right.id));
        this.groups = rights.filter(right => groupIds.has(right.id));
        const pools = new Set<string>();
        rights.forEach(right => right.pools.filter(pool => pool).forEach(pool => pools.add(pool)));
        this.pools = [...pools];
      }),

      this.shell.contracts$.subscribe(_contracts => {
        const investmentContracts = _contracts.filter(c => rightholderGroups.investors.includes(c.type));
        this.investments = investmentContracts.filter(c => {
          const amount = getDeclaredAmount(c);
          return amount[c.currency] > 0;
        });
      }),
    );
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  selectRevenueOwnerType(event: MatSelectChange) {
    this.revenueOwnerLabel$.next(ownerLabels[event.value] ?? 'Owner');

    let list: { id: string, name: string }[] = [];
    switch (event.value) {
      case 'org':
        list = this.shell.waterfall.rightholders.map(rightHolder => ({ id: rightHolder.id, name: rightHolder.name }));
        break;
      case 'right':
        list = this.rights.filter(right => !right.groupId).map(right => ({ id: right.id, name: right.name }));
        break;
      case 'group':
        list = this.groups.filter(right => right.groupId).map(right => ({ id: right.id, name: right.name }));
        break;
      case 'pool':
        list = this.pools.map(pool => ({ id: pool, name: pool }));
        break;
      default: break;
    }
    this.revenueOwnerList$.next(list);
  }
}
