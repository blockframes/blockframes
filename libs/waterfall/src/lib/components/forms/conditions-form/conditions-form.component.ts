
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';

import {
  Right,
  Condition,
  GroupScope,
  TargetValue, 
  ArrayOperator,
  PoolCondition,
  arrayOperator,
  ConditionTerms,
  EventCondition,
  GroupCondition,
  numberOperator,
  NumberOperator,
  RightCondition,
  ConditionAmount,
  ConditionDuration,
  WaterfallContract,
  WaterfallDocument,
  OrgRevenuCondition,
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

  revenueOwnerLabel$ = new BehaviorSubject('Owner');
  revenueOwnerList$ = new BehaviorSubject<{ id: string, name: string }[]>([]);

  rights: Right[] = [];
  groups: Right[] = [];
  pools: string[] = [];
  investments: WaterfallDocument<WaterfallContract>[] = [];

  numberOperator = numberOperator;
  arrayOperator = arrayOperator;

  subs: Subscription[] = [];

  condition: Condition;
  
  constructor(
    private shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnInit() {
    this.subs.push(
      this.shell.rights$.subscribe(rights => {
        const groupIds = new Set<string>();
        rights.forEach(right => {
          if(right.groupId) groupIds.add(right.groupId);
        });
        this.rights = rights.filter(right => !groupIds.has(right.id));
        this.groups = rights.filter(right => groupIds.has(right.id));
        const pools = new Set<string>();
        rights.forEach(right => right.pools.filter(pool => pool).forEach(pool => pools.add(pool)));
        this.pools = [...pools];
      }),

      this.shell.documents$.subscribe(documents => {
        this.investments = documents.filter(doc => doc.type === 'contract' && (doc.meta as WaterfallContract).price > 0) as WaterfallDocument<WaterfallContract>[];
      }),

      this.form.controls.revenuePercentage.valueChanges.subscribe(percent => {
        const target: TargetValue = {
          id: this.form.controls.revenueTarget.value,
          percent,
          in: 'investment'
        };
        if (this.form.controls.revenueOwnerType.value === 'org') {
          const payload: OrgRevenuCondition = {
            orgId: this.form.controls.revenueOwner.value,
            operator: this.form.controls.revenueOperator.value as NumberOperator,
            target,
          };
          this.condition = {
            name: this.form.controls.revenueOwnerType.value + this.form.controls.revenueType.value as any,
            payload,
          };
        }
        if (this.form.controls.revenueOwnerType.value === 'right') {
          const payload: RightCondition = {
            rightId: this.form.controls.revenueOwner.value,
            operator: this.form.controls.revenueOperator.value as NumberOperator,
            target,
          };
          this.condition = {
            name: this.form.controls.revenueOwnerType.value + this.form.controls.revenueType.value as any,
            payload,
          };
        }
        if (this.form.controls.revenueOwnerType.value === 'group') {
          const payload: GroupCondition = {
            groupId: this.form.controls.revenueOwner.value,
            operator: this.form.controls.revenueOperator.value as NumberOperator,
            target,
          };
          this.condition = {
            name: this.form.controls.revenueOwnerType.value + this.form.controls.revenueType.value as any,
            payload,
          };
        }
        if (this.form.controls.revenueOwnerType.value === 'pool') {
          const payload: PoolCondition = {
            pool: this.form.controls.revenueOwner.value,
            operator: this.form.controls.revenueOperator.value as NumberOperator,
            target,
          };
          this.condition = {
            name: this.form.controls.revenueOwnerType.value + this.form.controls.revenueType.value as any,
            payload,
          };
        }
      }),

      this.form.controls.revenueAmount.valueChanges.subscribe(amount => {

        if (this.form.controls.revenueOwnerType.value === 'org') {
          const payload: OrgRevenuCondition = {
            orgId: this.form.controls.revenueOwner.value,
            operator: this.form.controls.revenueOperator.value as NumberOperator,
            target: this.form.controls.revenueTargetType.value === 'amount'
              ? amount
              : {
                  id: this.form.controls.revenueTarget.value,
                  percent: this.form.controls.revenuePercentage.value,
                  in: this.form.controls.revenueTargetType.value === 'investment' ? 'investment' : 'orgs.expense'
                },
          };
          this.condition = {
            name: this.form.controls.revenueOwnerType.value + this.form.controls.revenueType.value as any,
            payload,
          };
        }

        if (this.form.controls.revenueOwnerType.value === 'right') {
          const payload: RightCondition = {
            rightId: this.form.controls.revenueOwner.value,
            operator: this.form.controls.revenueOperator.value as NumberOperator,
            target: this.form.controls.revenueTargetType.value === 'amount'
              ? amount
              : {
                  id: this.form.controls.revenueTarget.value,
                  percent: this.form.controls.revenuePercentage.value,
                  in: this.form.controls.revenueTargetType.value === 'investment' ? 'investment' : 'orgs.expense'
                },
          };
          this.condition = {
            name: this.form.controls.revenueOwnerType.value + this.form.controls.revenueType.value as any,
            payload,
          };
        }

        if (this.form.controls.revenueOwnerType.value === 'group') {
          const payload: GroupCondition = {
            groupId: this.form.controls.revenueOwner.value,
            operator: this.form.controls.revenueOperator.value as NumberOperator,
            target: this.form.controls.revenueTargetType.value === 'amount'
              ? amount
              : {
                  id: this.form.controls.revenueTarget.value,
                  percent: this.form.controls.revenuePercentage.value,
                  in: this.form.controls.revenueTargetType.value === 'investment' ? 'investment' : 'orgs.expense'
                },
          };
          this.condition = {
            name: this.form.controls.revenueOwnerType.value + this.form.controls.revenueType.value as any,
            payload,
          };
        }

        if (this.form.controls.revenueOwnerType.value === 'pool') {
          const payload: PoolCondition = {
            pool: this.form.controls.revenueOwner.value,
            operator: this.form.controls.revenueOperator.value as NumberOperator,
            target: this.form.controls.revenueTargetType.value === 'amount'
              ? amount
              : {
                  id: this.form.controls.revenueTarget.value,
                  percent: this.form.controls.revenuePercentage.value,
                  in: this.form.controls.revenueTargetType.value === 'investment' ? 'investment' : 'orgs.expense'
                },
          };
          this.condition = {
            name: this.form.controls.revenueOwnerType.value + this.form.controls.revenueType.value as any,
            payload,
          };
        }
      }),

      this.form.controls.salesDateFrom.valueChanges.subscribe(date => {
        const payload: ConditionDuration = {
          from: date,
          to: this.form.controls.salesDateOperator.value === 'between' ? this.form.controls.salesDateTo.value : undefined,
        };
        this.condition = {
          name: this.form.controls.salesType.value as any,
          payload,
        };
      }),
      this.form.controls.salesDateTo.valueChanges.subscribe(date => {
        const payload: ConditionDuration = {
          from: this.form.controls.salesDateOperator.value === 'between' ? this.form.controls.salesDateFrom.value : undefined,
          to: date,
        };
        this.condition = {
          name: this.form.controls.salesType.value as any,
          payload,
        };
      }),

      this.form.controls.salesAmount.valueChanges.subscribe(amount => {
        const payload: ConditionAmount = {
          operator: this.form.controls.salesOperator.value as NumberOperator,
          target: amount,
        };
        this.condition = {
          name: 'contractAmount',
          payload,
        };
      }),

      this.form.controls.salesTerms.valueChanges.subscribe(terms => {
        const payload: ConditionTerms = {
          type: this.form.controls.salesTermsType.value as GroupScope,
          operator: this.form.controls.salesTermsOperator.value as ArrayOperator,
          list: terms,
        };
        this.condition = {
          name: 'terms',
          payload,
        };
      }),

      this.form.controls.eventAmount.valueChanges.subscribe(amount => {
        const payload: EventCondition = {
          eventId: this.form.controls.eventName.value,
          operator: this.form.controls.eventOperator.value as NumberOperator,
          value: amount,
        };
        this.condition = {
          name: 'event',
          payload,
        };
      }),

      this.form.controls.eventList.valueChanges.subscribe(list => {
        const payload: EventCondition = {
          eventId: this.form.controls.eventName.value,
          operator: this.form.controls.eventOperator.value as ArrayOperator,
          value: list,
        };
        this.condition = {
          name: 'event',
          payload,
        };
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
