
// Angular
import { FormControl } from '@angular/forms';
import { add, Duration } from 'date-fns';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Component, ChangeDetectionStrategy, OnInit, Input, OnDestroy, Output, EventEmitter, OnChanges } from '@angular/core';

// Blockframes
import { rightholderGroups, RightholderRole, Waterfall } from '@blockframes/model';
import { BucketTermForm, createBucketTermControl } from '@blockframes/contract/bucket/form';
import {
  createExpenseTypeControl,
  createWaterfallInvestmentControl,
  ExpenseTypeForm,
  WaterfallDocumentForm,
  WaterfallDocumentFormValue,
  WaterfallInvestmentForm
} from '../../../form/document.form';
import { unique } from '@blockframes/utils/helpers';

@Component({
  selector: '[waterfall][form] waterfall-document-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentFormComponent implements OnInit, OnChanges, OnDestroy {

  @Input() waterfall: Waterfall;
  @Input() form: WaterfallDocumentForm;
  @Input() type: RightholderRole;

  public hideStartDate$ = new BehaviorSubject(true);

  public toggleTermsControl = new FormControl(true);
  public durationControl = new FormControl<number | undefined>(undefined);

  public periods: (keyof Duration)[] = ['days', 'weeks', 'months', 'years'];
  public periodControl = new FormControl<keyof Duration | undefined>(undefined);

  public licensee$ = new BehaviorSubject<string[]>([]); // buyer
  public licensor$ = new BehaviorSubject<string[]>([]); // seller

  private subscription: Subscription[] = [];

  public showExpenseTypes = false;
  public disabledLicensorValues: RightholderRole[] = [];
  public disabledLicenseeValues: RightholderRole[] = [];

  @Output() removeFile = new EventEmitter<boolean>(false);

  ngOnInit() {
    if (this.form.controls.terms.length === 0) this.addTerm();
    if (this.form.controls.price.length === 0) this.addInvest();
    const names = this.waterfall.rightholders.map(r => r.name);
    this.licensee$.next(names);
    this.licensor$.next(names);

    let previousLicensorId = '';
    let previousLicenseeId = '';
    this.subscription.push(
      this.form.valueChanges.subscribe((value: WaterfallDocumentFormValue) => {
        const filtered = names.filter(n => n !== value.licenseeName && n !== value.licensorName);
        this.licensor$.next(filtered);
        this.licensee$.next(filtered);

        // TODO #9577 factorize this code
        if (this.type === 'author') {
          if (value.licensorName) {
            const licensor = this.waterfall.rightholders.find(r => r.name === value.licensorName);
            const licensorRoles: RightholderRole[] = ['author'];
            if (licensor) {
              this.disabledLicensorValues = [...licensor.roles, 'author'];

              if (previousLicensorId && previousLicensorId !== licensor.id) {
                licensorRoles.push(...licensor.roles);
                previousLicensorId = licensor.id;
              } else if (value.licenseeRole?.length > 0) {
                licensorRoles.push(...licensor.roles, ...value.licensorRole);
                previousLicensorId = licensor.id;
              }

            } else {
              licensorRoles.push(...value.licensorRole);
              this.disabledLicensorValues = ['author'];
            }
            this.form.controls.licensorRole.setValue(unique(licensorRoles), { emitEvent: false });
          }

          if (value.licenseeName) {
            const licensee = this.waterfall.rightholders.find(r => r.name === value.licenseeName);
            const licenseeRoles: RightholderRole[] = ['producer'];
            if (licensee) {

              this.disabledLicenseeValues = [...licensee.roles, 'producer'];
              if (previousLicenseeId && (previousLicenseeId !== licensee.id)) {
                licenseeRoles.push(...licensee.roles);
                previousLicenseeId = licensee.id;
              } else if (value.licenseeRole?.length > 0) {
                licenseeRoles.push(...licensee.roles, ...value.licenseeRole);
                previousLicenseeId = licensee.id;
              }
            } else {
              licenseeRoles.push(...value.licenseeRole);
              this.disabledLicenseeValues = ['producer'];
            }
            this.form.controls.licenseeRole.setValue(unique(licenseeRoles), { emitEvent: false });
          }

        } else {

          if (value.licensorName) {
            const licensor = this.waterfall.rightholders.find(r => r.name === value.licensorName);
            const licensorRoles: RightholderRole[] = [];
            if (licensor) {
              this.disabledLicensorValues = licensor.roles;
              if (previousLicensorId && previousLicensorId !== licensor.id) {
                licensorRoles.push(...licensor.roles);
                previousLicensorId = licensor.id;
              } else if (value.licenseeRole?.length > 0) {
                licensorRoles.push(...licensor.roles, ...value.licensorRole);
                previousLicensorId = licensor.id;
              }
            } else {
              licensorRoles.push(...value.licensorRole);
              this.disabledLicensorValues = [];
            }
            this.form.controls.licensorRole.setValue(unique(licensorRoles), { emitEvent: false });
          }

          if (value.licenseeName) {
            const licensee = this.waterfall.rightholders.find(r => r.name === value.licenseeName);
            const licenseeRoles: RightholderRole[] = [this.type];
            if (licensee) {
              this.disabledLicenseeValues = [...licensee.roles, this.type];
              if (previousLicenseeId && (previousLicenseeId !== licensee.id)) {
                licenseeRoles.push(...licensee.roles);
                previousLicenseeId = licensee.id;
              } else if (value.licenseeRole?.length > 0) {
                licenseeRoles.push(...licensee.roles, ...value.licenseeRole);
                previousLicenseeId = licensee.id;
              }
            } else {
              licenseeRoles.push(...value.licenseeRole);
              this.disabledLicenseeValues = [this.type];
            }
            this.form.controls.licenseeRole.setValue(unique(licenseeRoles), { emitEvent: false });
          }
        }
      }),
      this.form.controls.endDate.valueChanges.subscribe(() => {
        this.durationControl.setValue(0);
        this.periodControl.setValue(undefined);
      }),
      combineLatest([
        this.durationControl.valueChanges,
        this.periodControl.valueChanges,
      ]).subscribe(([duration, period]) => {
        const newEndDate = add(this.form.controls.endDate.value, { [period]: duration });
        this.form.controls.endDate.setValue(newEndDate, { emitEvent: false });
      }),
    );

  }

  ngOnChanges() {
    const showTerms = rightholderGroups.withTerms.includes(this.type);
    this.toggleTermsControl.setValue(showTerms);

    this.showExpenseTypes = rightholderGroups.withStatements.includes(this.type);
    if (this.showExpenseTypes && this.form.controls.expenseTypes.length === 0) {
      this.form.controls.expenseTypes.push(ExpenseTypeForm.factory({}, createExpenseTypeControl));
    };

    // TODO #9577 factorize this code
    if (this.type === 'author') {
      const licensor = this.waterfall.rightholders.find(r => r.name === this.form.controls.licensorName.value);
      const licensorRole: RightholderRole[] = licensor ? [this.type, ...licensor.roles] : [this.type];
      this.form.controls.licensorRole.setValue(unique(licensorRole), { emitEvent: false });
      this.disabledLicensorValues = licensor?.roles ? [...licensor.roles, this.type] : [this.type];

      const licensee = this.waterfall.rightholders.find(r => r.name === this.form.controls.licenseeName.value);
      const licenseeRole: RightholderRole[] = licensee ? ['producer', ...licensee.roles] : ['producer'];
      this.form.controls.licenseeRole.setValue(unique(licenseeRole), { emitEvent: false });
      this.disabledLicenseeValues = licensee?.roles ? [...licensee.roles, 'producer'] : ['producer'];
      const producer = this.waterfall.rightholders.find(r => r.roles.includes('producer'));
      if (producer) this.form.controls.licenseeName.setValue(producer.name, { emitEvent: false });
    } else {
      const licensor = this.waterfall.rightholders.find(r => r.name === this.form.controls.licensorName.value);
      const licensorRole: RightholderRole[] = licensor ? licensor.roles : [];
      this.form.controls.licensorRole.setValue(unique(licensorRole), { emitEvent: false });
      this.disabledLicensorValues = licensor?.roles || [];

      const licensee = this.waterfall.rightholders.find(r => r.name === this.form.controls.licenseeName.value);
      const licenseeRole: RightholderRole[] = licensee ? [this.type, ...licensee.roles] : [this.type];
      this.form.controls.licenseeRole.setValue(unique(licenseeRole), { emitEvent: false });
      this.disabledLicenseeValues = licensee?.roles ? [...licensee.roles, this.type] : [this.type];
    }
  }

  ngOnDestroy() {
    this.subscription.forEach(s => s.unsubscribe());
  }

  toggleStartDate(event: MatSlideToggleChange) {
    this.hideStartDate$.next(event.checked);
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
}
