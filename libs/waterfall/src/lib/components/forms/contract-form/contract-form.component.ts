
// Angular
import { FormControl } from '@angular/forms';
import { add } from 'date-fns';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Component, ChangeDetectionStrategy, OnInit, Input, OnDestroy, Output, EventEmitter, OnChanges } from '@angular/core';

// Blockframes
import { Period, rightholderGroups, RightholderRole, Waterfall } from '@blockframes/model';
import { BucketTermForm, createBucketTermControl } from '@blockframes/contract/bucket/form';
import {
  createExpenseTypeControl,
  createWaterfallInvestmentControl,
  ExpenseTypeForm,
  WaterfallContractForm,
  WaterfallContractFormValue,
  WaterfallInvestmentForm
} from '../../../form/contract.form';
import { unique } from '@blockframes/utils/helpers';
import { dateInputFormat } from '@blockframes/utils/date-adapter';

@Component({
  selector: '[waterfall][form] waterfall-contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallContractFormComponent implements OnInit, OnChanges, OnDestroy {

  @Input() waterfall: Waterfall;
  @Input() form: WaterfallContractForm;
  @Input() type: RightholderRole;
  @Input() toggleTermsControl: FormControl<boolean>;

  public hideStartDate$ = new BehaviorSubject(true);
  public hideEndDate$ = new BehaviorSubject(false);
  private noLimitEndDate = new Date('2199/01/01');
  public dateInputFormat = dateInputFormat;
  public durationControl = new FormControl<number | undefined>(undefined);

  public periodControl = new FormControl<Period | undefined>(undefined);

  public licensee$ = new BehaviorSubject<string[]>([]); // buyer
  public licensor$ = new BehaviorSubject<string[]>([]); // seller

  private subscription: Subscription[] = [];

  public showExpenseTypes = false;
  public showRightToogle = false;
  public disabledValues: { licensors: RightholderRole[], licensees: RightholderRole[] } = { licensors: [], licensees: [] };
  private previousIds: { licensor: string, licensee: string } = { licensor: '', licensee: '' };

  @Output() removeFile = new EventEmitter<boolean>(false);

  ngOnInit() {
    if (this.form.controls.terms.length === 0) this.addTerm();
    if (this.form.controls.price.length === 0) this.addInvest();
    const names = this.waterfall.rightholders.map(r => r.name);
    this.licensee$.next(names);
    this.licensor$.next(names);

    if (this.form.value.licensorName) {
      const licensor = this.waterfall.rightholders.find(r => r.name === this.form.value.licensorName);
      if (licensor) this.previousIds.licensor = licensor.id;
    }

    if (this.form.value.licenseeName) {
      const licensee = this.waterfall.rightholders.find(r => r.name === this.form.value.licenseeName);
      if (licensee) this.previousIds.licensee = licensee.id;
    }

    if (this.form.controls.startDate.value?.getTime() === this.form.controls.signatureDate.value?.getTime()) {
      this.hideStartDate$.next(true);
    } else {
      this.hideStartDate$.next(false);
    }

    if (this.form.controls.endDate.value?.getTime() === this.noLimitEndDate.getTime()) {
      this.hideEndDate$.next(true);
    } else {
      this.hideEndDate$.next(false);
    }

    if (this.hideStartDate$.value && this.form.controls.signatureDate.value) {
      this.form.controls.startDate.setValue(this.form.controls.signatureDate.value, { emitEvent: false });
    }

    if (this.hideEndDate$.value) {
      this.form.controls.endDate.setValue(this.noLimitEndDate, { emitEvent: false });
    }

    this.subscription.push(
      this.form.valueChanges.subscribe((value: WaterfallContractFormValue) => {
        const filtered = names.filter(n => n !== value.licenseeName && n !== value.licensorName);
        this.licensor$.next(filtered);
        this.licensee$.next(filtered);

        this.handleRoles(value);
      }),
      this.form.controls.endDate.valueChanges.subscribe(() => {
        this.durationControl.setValue(0, { emitEvent: false });
        this.periodControl.setValue(undefined);
      }),
      combineLatest([
        this.durationControl.valueChanges,
        this.periodControl.valueChanges,
      ]).subscribe(([duration, period]) => {
        if (duration === undefined || !period) return;
        const newEndDate = add(this.form.controls.startDate.value, { [period]: duration });
        this.form.controls.endDate.setValue(newEndDate, { emitEvent: false });
      }),
      this.form.controls.signatureDate.valueChanges.subscribe(date => {
        if (this.hideStartDate$.value) {
          this.form.controls.startDate.setValue(date, { emitEvent: false });
          if (this.durationControl.value && this.periodControl.value) {
            const newEndDate = add(this.form.controls.startDate.value, { [this.periodControl.value]: this.durationControl.value });
            this.form.controls.endDate.setValue(newEndDate, { emitEvent: false });
          }
        }
      }),
      this.form.controls.startDate.valueChanges.subscribe(date => {
        if (!this.hideStartDate$.value && this.durationControl.value && this.periodControl.value) {
          const newEndDate = add(date, { [this.periodControl.value]: this.durationControl.value });
          this.form.controls.endDate.setValue(newEndDate, { emitEvent: false });
        }
      }),
      this.hideStartDate$.subscribe(hide => {
        if (hide && this.form.controls.signatureDate.value) {
          this.form.controls.startDate.setValue(this.form.controls.signatureDate.value, { emitEvent: false });
        }
      }),
      this.hideEndDate$.subscribe(hide => {
        if (hide) this.form.controls.endDate.setValue(this.noLimitEndDate, { emitEvent: false });
      }),
    );

  }

  ngOnChanges() {
    this.previousIds = { licensor: '', licensee: '' };
    const showTerms = rightholderGroups.withTerms.includes(this.type);
    this.showRightToogle = showTerms;
    this.toggleTermsControl.setValue(this.form.get('terms').value.length > 0);

    this.showExpenseTypes = rightholderGroups.withStatements.includes(this.type);
    if (this.showExpenseTypes && this.form.controls.expenseTypes.length === 0) {
      this.form.controls.expenseTypes.push(ExpenseTypeForm.factory({}, createExpenseTypeControl));
    };

    const defaultLicensorRoles = this.getDefaultLicensorRoles();
    const licensor = this.waterfall.rightholders.find(r => r.name === this.form.controls.licensorName.value);
    const licensorRole: RightholderRole[] = licensor?.roles ? [...defaultLicensorRoles, ...licensor.roles] : defaultLicensorRoles;
    this.form.controls.licensorRole.setValue(unique(licensorRole), { emitEvent: false });
    this.disabledValues.licensors = licensor?.roles ? [...licensor.roles, ...defaultLicensorRoles] : defaultLicensorRoles;

    const defaultLicenseeRoles = this.getDefaultLicenseeRoles();
    const licensee = this.waterfall.rightholders.find(r => r.name === this.form.controls.licenseeName.value);
    const licenseeRole: RightholderRole[] = licensee ? [...defaultLicenseeRoles, ...licensee.roles] : defaultLicenseeRoles;
    this.form.controls.licenseeRole.setValue(unique(licenseeRole), { emitEvent: false });
    this.disabledValues.licensees = licensee?.roles ? [...licensee.roles, ...defaultLicenseeRoles] : defaultLicenseeRoles;

    if (['author', 'agent'].includes(this.type)) {
      const producer = this.waterfall.rightholders.find(r => r.roles.includes('producer'));
      if (producer) this.form.controls.licenseeName.setValue(producer.name, { emitEvent: false });
    }
  }

  ngOnDestroy() {
    this.subscription.forEach(s => s.unsubscribe());
  }

  toggleStartDate(event: MatSlideToggleChange) {
    this.hideStartDate$.next(event.checked);
  }

  toggleEndDate(event: MatSlideToggleChange) {
    this.hideEndDate$.next(event.checked);
  }

  addTerm() {
    this.form.controls.terms.push(BucketTermForm.factory({}, createBucketTermControl));
  }

  addInvest() {
    this.form.controls.price.push(WaterfallInvestmentForm.factory({}, createWaterfallInvestmentControl));
  }

  change($event: 'removed' | 'added') {
    if ($event === 'removed') {
      this.removeFile.emit(true);
      this.form.get('file').get('id').setValue(this.form.value.id);
    } else {
      this.removeFile.emit(false);
    }
    this.form.markAsDirty();
  }

  private handleRoles(value: WaterfallContractFormValue) {

    const defaultLicensorRoles = this.getDefaultLicensorRoles();
    if (value.licensorName) {
      const licensor = this.waterfall.rightholders.find(r => r.name === value.licensorName);
      const licensorRoles = [...defaultLicensorRoles];
      if (licensor) {
        this.disabledValues.licensors = [...licensor.roles, ...defaultLicensorRoles];
        if (!this.previousIds.licensor || this.previousIds.licensor !== licensor.id) {
          licensorRoles.push(...licensor.roles);
          this.previousIds.licensor = licensor.id;
        } else if (value.licensorRole?.length > 0) {
          licensorRoles.push(...licensor.roles, ...value.licensorRole);
          this.previousIds.licensor = licensor.id;
        }

      } else {
        licensorRoles.push(...value.licensorRole);
        this.disabledValues.licensors = defaultLicensorRoles;
        this.previousIds.licensor = '';
      }
      this.form.controls.licensorRole.setValue(unique(licensorRoles), { emitEvent: false });
    }

    const defaultLicenseeRoles = this.getDefaultLicenseeRoles();
    if (value.licenseeName) {
      const licensee = this.waterfall.rightholders.find(r => r.name === value.licenseeName);
      const licenseeRoles = [...defaultLicenseeRoles];
      if (licensee) {
        this.disabledValues.licensees = [...licensee.roles, ...defaultLicenseeRoles];
        if (!this.previousIds.licensee || (this.previousIds.licensee !== licensee.id)) {
          licenseeRoles.push(...licensee.roles);
          this.previousIds.licensee = licensee.id;
        } else if (value.licenseeRole?.length > 0) {
          licenseeRoles.push(...licensee.roles, ...value.licenseeRole);
          this.previousIds.licensee = licensee.id;
        }
      } else {
        licenseeRoles.push(...value.licenseeRole);
        this.disabledValues.licensees = defaultLicenseeRoles;
        this.previousIds.licensee = '';
      }
      this.form.controls.licenseeRole.setValue(unique(licenseeRoles), { emitEvent: false });
    }
  }

  private getDefaultLicenseeRoles(): RightholderRole[] {
    switch (this.type) {
      case 'author':
      case 'agent':
        return ['producer'];
      case 'other':
        return [];
      default:
        return [this.type];
    }
  }

  private getDefaultLicensorRoles(): RightholderRole[] {
    switch (this.type) {
      case 'author':
        return ['author'];
      case 'agent':
        return ['agent'];
      default:
        return [];
    }
  }
}
