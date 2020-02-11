import { ContractVersionForm } from '@blockframes/contract/version/form/version.form';
import { startWith, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ContractVersionPaymentScheduleForm } from './payment-schedule.form';
import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, AfterViewInit, } from '@angular/core';
import { MovieEvent, PaymentEvent, TimeUnit, TemporalityUnit } from '@blockframes/utils/common-interfaces/terms'
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { PaymentScheduleRaw } from '@blockframes/utils/common-interfaces';

@Component({
  selector: '[form] contract-version-form-schedule',
  templateUrl: 'payment-schedule.component.html',
  styleUrls: ['payment-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentScheduleComponent implements OnInit, OnDestroy {
  @Input() form: FormList<any, ContractVersionForm>;

  public triggerEvents = Object.assign({}, MovieEvent, PaymentEvent)

  public paymentEvents = PaymentEvent;

  public durations = TimeUnit;

  public periodCtrl: FormControl = new FormControl(false);

  public eventCtrl: FormControl = new FormControl(true);

  public radioCtrl: FormControl = new FormControl('default');

  private periodSub: Subscription;

  private eventSub: Subscription;

  ngOnInit() {
    // If start is defined we want to change the toggle button state
    if (!this.findStartValue(this.paymentSchedule)) {
      this.periodCtrl.setValue(true);
      this.eventCtrl.setValue(false);
    }
    this.periodSub = this.periodCtrl.valueChanges
      .pipe(
        startWith(this.paymentSchedule),
        tap(value => this.toggleForm('start', value))
      )
      .subscribe();
    this.eventSub = this.eventCtrl.valueChanges
      .pipe(
        startWith(this.findStartValue(this.paymentSchedule)),
        tap(value => this.toggleForm('floatingStart', value))
      )
      .subscribe();
  }

  get paymentTermFloatingStart() {
    return this.form.at(0).get('paymentTerm').get('floatingStart');
  }

  get customPaymentSchedule() {
    return this.form.at(0).get('customPaymentSchedule');
  }

  get paymentSchedule() {
    return this.form.at(0).get('paymentSchedule');
  }

  /**
   * @description enables or disables a form
   * @param formName name of the control
   * @param value for determine what should happen
   */
  private toggleForm(formName: string, value: boolean) {
    const form = this.paymentSchedule.at(0).get('date').get(formName as 'start' | 'floatingStart');
    value ? form.enable() : form.disable();
  }
  /**paymentTerm
   * @description when one toggle button is set, unset the other one for the UI
   * @param event event value from toggle button
   * @param type from where the functino was called
   */
  public updateState(event: MatSlideToggleChange, type: 'start' | 'period') {
    // We need a type here otherwise we get a recursion
    if (type === 'start') {
      this.periodCtrl.setValue(event.checked);
      this.eventCtrl.setValue(!this.eventCtrl.value);
    } else {
      this.periodCtrl.setValue(!this.periodCtrl.value);
      this.eventCtrl.setValue(event.checked);
    }
  }

  /**
   * @description helper function. Looks up a value and determines whether or not to toggle a button
   * @param form to get the value from
   */
  private findStartValue(form: FormList<PaymentScheduleRaw<Date>, ContractVersionPaymentScheduleForm>): boolean {
    const hasStartDate = [];
    for (const control of form.controls) {
      if (control.get('date').get('start').value) {
        hasStartDate.push(control.get('date').get('start').value)
      }
    }
    return !!hasStartDate
  }

  /**
   * @description adds a payment schedule array
   */
  public addPayment() {
    this.paymentSchedule.add()
  }

  /**
   * @description removes control
   * @param index index of payment schedule array
   */
  public removePayment(index: number) {
    this.paymentSchedule.removeAt(index)
  }

  ngOnDestroy() {
    this.eventSub.unsubscribe();
    this.periodSub.unsubscribe();
    // If user checked radio button periodic, we want to update the form and set a default value
    if (this.radioCtrl.value === 'periodic') {
      const state = []
      this.form.controls.forEach(control => {
        control.get('paymentSchedule').controls.forEach(payment => {
          if (payment.get('date').get('floatingDuration').get('duration').value) {
            payment.get('date').get('floatingDuration').get('temporality').setValue(TemporalityUnit.every)
            state.push(payment.value)
          }
        })
      })
      this.paymentSchedule.patchAllValue(state);
    }
  }
}
