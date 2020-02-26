import { toDate } from '@blockframes/utils/helpers';
import { ContractVersionForm } from '@blockframes/contract/version/form/version.form';
import { startWith, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ContractVersionPaymentScheduleForm } from './payment-schedule.form';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input, OnDestroy,
  QueryList,
  ViewChildren,
  AfterViewInit,
} from '@angular/core';
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
export class PaymentScheduleComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() form: FormList<any, ContractVersionForm>;

  // concated enums
  public triggerEvents = Object.assign({}, MovieEvent, PaymentEvent)

  public paymentEvents = PaymentEvent;

  public durations = TimeUnit;

  public periodCtrl: FormControl = new FormControl(false);

  public eventCtrl: FormControl = new FormControl(true);

  public radioCtrl: FormControl = new FormControl('');

  private periodSub: Subscription;

  private eventSub: Subscription;

  private radioSub: Subscription;

  // Inputs from event section
  @ViewChildren('eventButtons') eventButtons: QueryList<HTMLButtonElement>

  ngOnInit() {
    /**
     * We want to have three payment schedules form groups from the beginning,
     * so we can disable or enable only the inputs we want.
     * At initialization we have one so we add two to get three.
     */
    if (this.paymentSchedule.controls.length <= 1) {
      this.paymentSchedule.add();
      this.paymentSchedule.add();
    }
    this.periodSub = this.periodCtrl.valueChanges
      .pipe(
        startWith(this.findStartValue(this.paymentSchedule)),
        tap(value => this.toggleForm('start', value))
      )
      .subscribe();
    this.eventSub = this.eventCtrl.valueChanges
      .pipe(
        startWith(!this.findStartValue(this.paymentSchedule)),
        tap(value => this.toggleForm('floatingStart', value))
      )
      .subscribe();
    // If we got data from the DB, convert it into date
    this.form.at(0).get('paymentSchedule').controls.forEach(control => {
      const start = control.get('date').get('start');
      start.setValue(toDate(start.value));
    })
  }

  ngAfterViewInit() {
    /**
     * Everytime the user switches to another radio button,
     * we want to disable everything and only enable the inputs
     * we need
     */
    this.radioSub = this.radioCtrl.valueChanges.pipe(
      startWith(this.setRadioButton()),
      tap(value => {
        if (value === 'other') {
          this.disableAll();
          this.customPaymentSchedule.enable();
          this.toggleDurationPeriod('first');
          this.activateFirstDuration();
        } else if (value === 'periodic') {
          this.disableAll();
          this.toggleDurationPeriod('last');
          this.eventCtrl.enable();
          this.periodCtrl.enable();
          this.paymentSchedule.last().get('percentage').enable();
          this.activateFirstDuration();
          if (this.periodCtrl.value) {
            this.paymentSchedule.last().get('date').get('start').enable();
          } else {
            this.paymentSchedule.last().get('date').get('floatingStart').enable();
          }
        } else if (value === 'event') {
          this.disableAll();
          this.updateFormExceptEventForm();
          this.activateFirstDuration();
        } else {
          this.disableAll();
          this.activateFirstDuration();
        }
      })
    ).subscribe();
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
   * @description checks if contract is new or a draft by determine the default value is set
   */
  get hasTemporallyValue(): boolean {
    const tempValue = []
    for (const control of this.paymentSchedule.controls) {
      if (control.get('date').get('floatingDuration').get('temporality').value) {
        tempValue.push(control.get('date').get('floatingDuration').get('temporality').value)
      }
    }
    return tempValue.includes(TemporalityUnit.every);
  }

  /**paymentTerm
   * @description when one toggle button is set, unset the other one for the UI
   * @param event event value from toggle button
   * @param type from where the functino was called
   */
  public updateState(event: MatSlideToggleChange, type: 'start' | 'event') {
    const floatingStartForm = this.paymentSchedule.last().get('date').get('floatingStart');
    const startForm = this.paymentSchedule.last().get('date').get('start');
    // We need a type here otherwise we get a recursion
    if (type === 'start') {
      this.periodCtrl.setValue(event.checked);
      this.eventCtrl.setValue(!this.eventCtrl.value);
      if (event.checked) {
        startForm.enable(), floatingStartForm.disable()
      } else {
        startForm.disable(), floatingStartForm.enable()
      }
    } else {
      this.periodCtrl.setValue(!this.periodCtrl.value);
      this.eventCtrl.setValue(event.checked);
      if (event.checked) {
        floatingStartForm.enable(), startForm.disable()
      } else {
        floatingStartForm.disable(), startForm.enable()
      }
    }
  }

  /**
   * @description adds a payment schedule array
   */
  public addPayment() {
    this.paymentSchedule.add()
    this.updateFormExceptEventForm();
    this.activateFirstDuration();
  }

  /**
   * @description removes control
   * @param index index of payment schedule array
   */
  public removePayment(index: number) {
    this.paymentSchedule.removeAt(index)
  }

  /**
   * @description reset the form and start over
   * @param fromButton we need to distinguish if the user wants to reset the form
   * or if the user only switches between the radio buttons
   */
  public resetVersionForm(fromResetButton?: boolean) {
    const index = this.paymentSchedule.controls.length;
    for (let i = 0; i < index - 2; i++) {
      this.removePayment(i);
    }
    this.disableAll();
    this.activateFirstDuration()
    this.paymentSchedule.reset();
    this.form.at(0).get('customPaymentSchedule').reset();
    if (fromResetButton) {
      this.radioCtrl.reset();
    }
  }

  /**
   * @description helper function to determine if remove button should be shown
   * @param index of current iteration
   * @param isFirst if first element, dont show remove button
   */
  public showRemoveButton(index: number, isFirst: boolean, isLast: boolean): boolean {
    const length = this.paymentSchedule.controls.length;
    if (isFirst && isLast) {
      return false;
    }
    return length < index + 3 ? false : true;
  }

  /**
   * @description helper function, disables all inputs and buttons
   */
  private disableAll() {
    this.customPaymentSchedule.disable();
    this.eventCtrl.disable();
    this.periodCtrl.disable();
    this.eventButtons.forEach(button => button.disabled = true)
    this.paymentSchedule.controls.forEach(control => {
      const date = control.get('date');
      control.get('percentage').disable()
      date.get('floatingStart').disable();
      date.get('start').disable()
      date.get('floatingDuration').get('unit').disable();
      date.get('floatingDuration').get('duration').disable();
    });
  }

  /**
   * @description keeps the payment term active
   */
  private activateFirstDuration() {
    this.paymentSchedule.at(0).get('date').get('floatingDuration').get('unit').enable();
    this.paymentSchedule.at(0).get('date').get('floatingDuration').get('duration').enable();
    this.paymentSchedule.at(0).get('date').get('floatingStart').enable();
  }

  /**
   * @description helper function to enable the paymentSchedule form controls
   * @param position specifies where to enable the inputs
   */
  private toggleDurationPeriod(position: 'last' | 'first') {
    const last = this.paymentSchedule.last().get('date').get('floatingDuration');
    const first = this.paymentSchedule.at(0).get('date').get('floatingDuration');
    if (position === 'last') {
      last.get('duration').enable();
      last.get('unit').enable();
    } else {
      first.get('duration').enable();
      first.get('unit').enable();
    }
  }

  /**
   * @description enables or disables a form
   * @param formName name of the control
   * @param value for determine what should happen
   */
  private toggleForm(formName: 'start' | 'floatingStart', value: boolean) {
    const form = this.paymentSchedule.last().get('date').get(formName);
    value ? form.enable() : form.disable();
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
    return !!hasStartDate.length;
  }

  /**
   * @description checks which button should be active initiale
   * @param form 
   */
  private setRadioButton() {
    if (this.form.at(0).get('customPaymentSchedule').value) {
      this.radioCtrl.setValue('other');
      return 'other';
    } else if (this.hasTemporallyValue) {
      this.radioCtrl.setValue('periodic');
      return 'periodic';
    } else if (this.paymentSchedule.at(0).get('percentage').value) {
      this.radioCtrl.setValue('event');
      return 'event';
    } else {
      this.radioCtrl.reset('')
      return '';
    }
  }

  /**
   * @description function that renders the view
   */
  private updateFormExceptEventForm() {
    this.disableAll();
    const index = this.paymentSchedule.controls.length - 1;
    for (let i = 0; i < index; i++) {
      this.paymentSchedule.at(i).get('percentage').enable();
      this.paymentSchedule.at(i).get('date').get('floatingStart').enable();
    }
    this.eventButtons.forEach(button => button.disabled = false)
  }

  ngOnDestroy() {
    this.eventSub.unsubscribe();
    this.periodSub.unsubscribe();
    this.radioSub.unsubscribe();
    // If user checked radio button periodic, we want to update the form and set a default value
    if (this.radioCtrl.value === 'periodic') {
      this.paymentSchedule.last().get('date').get('floatingDuration').get('temporality').setValue(TemporalityUnit.every)
    }
  }
}
