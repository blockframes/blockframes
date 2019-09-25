import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ControlContainer, FormArray } from '@angular/forms';
import { createDeadlineFormGroup } from '../../forms/informations.form';
import { Currencies } from '../../+state';
import { PercentageStateMatcher } from '@blockframes/utils';

export function calculAmount(total: number, percentage: number): number {
  return total * percentage / 100;
}

@Component({
  selector: '[formGroup] delivery-informations-deadlines-form',
  templateUrl: './delivery-informations-deadlines-form.component.html',
  styleUrls: ['./delivery-informations-deadlines-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsDeadlinesFormComponent {
  constructor(public controlContainer: ControlContainer) {}

  public currencies = Currencies;
  public percentageMatcher = new PercentageStateMatcher();

  public get control() {
    return this.controlContainer.control;
  }

  public get mgDeadlines(): FormArray {
    return this.control.get('mgDeadlines') as FormArray;
  }

  public get mgAmount(): number {
    return this.control.get('mgAmount').value;
  }

  public getPercentage(index: number) {
    return this.mgDeadlines.controls[index].get('percentage').value;
  }

  public calculDeadlineAmount(index: number) {
    return calculAmount(this.mgAmount, this.getPercentage(index));
  }

  public addDeadline() {
    this.mgDeadlines.push(createDeadlineFormGroup({ label: null, percentage: null, date: null }));
  }

  public removeDeadline(index: number) {
    this.mgDeadlines.removeAt(index);
  }
}
