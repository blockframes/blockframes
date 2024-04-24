
import { BehaviorSubject, Subscription, combineLatest, startWith } from 'rxjs';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, Pipe, PipeTransform } from '@angular/core';

import {
  Right,
  arrayOperator,
  numberOperator,
  WaterfallContract,
  rightholderGroups,
  getDeclaredAmount,
  ConditionOwnerLabel,
  isDefaultVersion,
  getDefaultVersionId,
  ExpenseType,
  createExpenseType,
  Waterfall,
  PricePerCurrency,
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';

import { ConditionForm } from '../../../form/condition.form';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseTypesModalComponent } from '../../expense/expense-types-modal/expense-types-modal.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormList } from '@blockframes/utils/form';
import { ExpenseTypeForm } from '../../../form/contract.form';
import { WaterfallService } from '../../../waterfall.service';
import { dateInputFormat } from '@blockframes/utils/date-adapter';

@Component({
  selector: 'waterfall-conditions-form',
  templateUrl: './conditions-form.component.html',
  styleUrls: ['./conditions-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallConditionsFormComponent implements OnInit, OnDestroy {

  @Input() form: ConditionForm;
  @Input() rightId: string;

  public revenueOwnerList$ = new BehaviorSubject<{ id: string, name: string }[]>([]);
  public investments: WaterfallContract[] = [];
  public numberOperator = numberOperator;
  public arrayOperator = arrayOperator;
  public toggleRateControl = new FormControl(false);
  public expenseTypes: ExpenseType[] = [];
  public waterfall$ = this.shell.waterfall$;
  public dateInputFormat = dateInputFormat;
  public versionId$ = this.shell.versionId$;
  public displayForm$ = new BehaviorSubject<boolean>(true);

  private rights: Right[] = [];
  private groups: Right[] = [];
  private pools: string[] = [];
  private contractId: string;
  private subs: Subscription[] = [];

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private waterfallService: WaterfallService
  ) { }

  ngOnInit() {
    this.displayForm$.next(this.form.enabled);
    this.subs.push(
      combineLatest([this.shell.rights$, this.shell.contracts$, this.shell.waterfall$]).subscribe(([rights, contracts, waterfall]) => {
        const groupIds = new Set<string>();
        rights.forEach(right => {
          if (right.groupId) groupIds.add(right.groupId);
        });
        this.rights = rights.filter(right => !groupIds.has(right.id));
        this.groups = rights.filter(right => groupIds.has(right.id));
        const pools = new Set<string>();
        rights.forEach(right => right.pools.filter(pool => pool).forEach(pool => pools.add(pool)));
        this.pools = [...pools];

        const investmentContracts = contracts.filter(c => rightholderGroups.investors.includes(c.type));
        this.investments = investmentContracts.filter(c => {
          const amount = getDeclaredAmount(c);
          return amount[c.currency] > 0;
        });

        const right = rights.find(r => r.id === this.rightId);
        if (!right) return; // avoid error that can happen during a right deletion
        const isProducerRight = waterfall.rightholders.find(r => r.id === right.rightholderId)?.roles.includes('producer');
        this.contractId = isProducerRight ? 'directSales' : right.contractId;
        this.expenseTypes = waterfall.expenseTypes[this.contractId] || [];
      }),

      this.form.controls.conditionType.valueChanges.subscribe(v => {
        this.displayForm$.next(!!v || this.form.enabled);
      }),

      this.form.controls.revenueOwnerType.valueChanges.pipe(startWith(this.form.controls.revenueOwnerType.value)).subscribe(value => {
        if (value) this.selectRevenueOwnerType(value);
      }),

      this.form.controls.interestRate.valueChanges.subscribe(value => {
        this.toggleRateControl.setValue(value > 0);
      }),

      this.toggleRateControl.valueChanges.subscribe(value => {
        if (!value && this.form.controls.interestRate.value !== 0) this.form.controls.interestRate.setValue(0);
      }),

      this.form.controls.salesTerms.valueChanges.subscribe(() => {
        // Hack to force the valueChanges in parent component
        this.form.controls.salesTermsOperator.setValue(this.form.controls.salesTermsOperator.value);
      }),

      this.form.controls.salesTermsType.valueChanges.subscribe(() => {
        this.form.controls.salesTerms.setValue([]);
      })
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
        list = this.rights.map(right => ({ id: right.id, name: right.name }));
        break;
      case 'group':
        list = this.groups.map(right => ({ id: right.id, name: right.name }));
        break;
      case 'pool':
        list = this.pools.map(pool => ({ id: pool, name: pool }));
        break;
      default: break;
    }
    this.revenueOwnerList$.next(list);
  }

  public editExpenseType(waterfall: Waterfall) {
    if (!this.contractId) {
      this.snackBar.open('Please define contract first.', 'close', { duration: 5000 });
      return;
    }

    const versionId = (!this.shell.versionId$.value || isDefaultVersion(this.shell.waterfall, this.shell.versionId$.value)) ? 'default' : this.shell.versionId$.value;
    const versions = this.shell.waterfall.versions.map(v => v.id).filter(id => id !== getDefaultVersionId(this.shell.waterfall));
    const form = FormList.factory<ExpenseType, ExpenseTypeForm>([], expenseType => new ExpenseTypeForm(expenseType, versions));

    if (this.expenseTypes.length > 0) {
      this.expenseTypes.forEach(expenseType => form.add(expenseType));
    } else {
      form.add(createExpenseType({ contractId: this.contractId }));
    }

    this.dialog.open(ExpenseTypesModalComponent, {
      data: createModalData({
        versionId,
        form,
        onConfirm: () => {
          const { expenseTypes, id } = waterfall;
          const expenseType = form.getRawValue().filter(c => !!c.name).map(c => createExpenseType({
            ...c,
            contractId: this.contractId,
            id: c.id || this.waterfallService.createId(),
          }));
          expenseTypes[this.contractId] = expenseType;

          return this.waterfallService.update({ id, expenseTypes });
        }
      })
    });
  }
}

@Pipe({ name: 'expenseTypeCap' })
export class ExpenseTypeCapPipe implements PipeTransform {
  transform(typeId: string, expenseTypes: ExpenseType[], versionId: string): PricePerCurrency {
    if (!typeId) return undefined;
    const expenseType = expenseTypes.find(type => type.id === typeId);
    if (!expenseType) return undefined;
    const cap = versionId && expenseType.cap.version[versionId] ? expenseType.cap.version[versionId] : expenseType.cap.default;
    return cap ? { [expenseType.currency]: cap } : undefined;
  }
}