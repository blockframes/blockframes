import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ControlContainer, FormArray } from '@angular/forms';
import { createDeadlineFormGroup } from '../../forms/informations.form';
import { Currency } from '../../+state';

@Component({
  selector: '[formGroup] delivery-informations-deadlines-form',
  templateUrl: './delivery-informations-deadlines-form.component.html',
  styleUrls: ['./delivery-informations-deadlines-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsDeadlinesFormComponent {
  constructor(public controlContainer: ControlContainer) {}

  public currencies = Object.values(Currency);

  public get control() {
    return this.controlContainer.control;
  }

  public get mgDeadlines(): FormArray {
    return this.controlContainer.control.get('mgDeadlines') as FormArray;
  }

  public get deliveryAmount(): number {
    return this.controlContainer.control.get('mgAmount').value;
  }

  public calculAmountWithPercentage(index: number) {
    return this.deliveryAmount * this.mgDeadlines.controls[index].get('percentage').value / 100;
  }

  public addDeadline() {
    this.mgDeadlines.push(createDeadlineFormGroup({ label: null, percentage: null, date: null }));
  }

  public removeDeadline(index: number) {
    this.mgDeadlines.removeAt(index);
  }
}
