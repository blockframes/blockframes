import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ControlContainer, FormArray } from '@angular/forms';
import { createDeadlineFormGroup } from '../../forms/informations.form';

@Component({
  selector: '[formGroup] delivery-informations-deadlines-form',
  templateUrl: './delivery-informations-deadlines-form.component.html',
  styleUrls: ['./delivery-informations-deadlines-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsDeadlinesFormComponent {
  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }

  public get deadlines(): FormArray {
    return this.controlContainer.control.get('deadlines') as FormArray;
  }

  public addDeadline() {
    this.deadlines.push(createDeadlineFormGroup({ label: null, percentage: null, date: null }));
  }

  public removeDeadline(index: number) {
    this.deadlines.removeAt(index);
  }
}
