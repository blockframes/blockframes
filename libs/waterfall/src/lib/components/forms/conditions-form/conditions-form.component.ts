
import { BehaviorSubject, Subscription, map } from 'rxjs';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';

import {
  Right,
  arrayOperator,
  numberOperator,
  WaterfallContract,
  rightholderGroups,
  getDeclaredAmount,
  ConditionOwnerLabel,
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';

import { ConditionForm } from './condition.form';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'waterfall-conditions-form',
  templateUrl: './conditions-form.component.html',
  styleUrls: ['./conditions-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallConditionsFormComponent implements OnInit, OnDestroy {

  @Input() form: ConditionForm;

  public revenueOwnerList$ = new BehaviorSubject<{ id: string, name: string }[]>([]);
  public investments: WaterfallContract[] = [];
  public numberOperator = numberOperator;
  public arrayOperator = arrayOperator;
  public toggleRateControl = new FormControl(false);
  public expenseTypes$ = this.shell.waterfall$.pipe(map(w => Object.values(w.expenseTypes)), map(e => e.flat()));

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

      this.form.controls.revenueOwnerType.valueChanges.subscribe(value => {
        if (value) this.selectRevenueOwnerType(value);
      }),

      this.form.controls.interestRate.valueChanges.subscribe(value => {
        this.toggleRateControl.setValue(value > 0);
      }),

      this.toggleRateControl.valueChanges.subscribe(value => {
        if (!value && this.form.controls.interestRate.value !== 0) this.form.controls.interestRate.setValue(0);
      }),
    );
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  private selectRevenueOwnerType(revenueOwnerType: ConditionOwnerLabel) {
    let list: { id: string, name: string }[] = [];
    switch (revenueOwnerType) {
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
