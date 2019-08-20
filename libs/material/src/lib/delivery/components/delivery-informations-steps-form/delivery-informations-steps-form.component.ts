import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer, FormArray } from '@angular/forms';
import { createStepFormGroup } from '../../forms/informations.form';

@Component({
  selector: '[formGroup] delivery-informations-steps-form',
  templateUrl: './delivery-informations-steps-form.component.html',
  styleUrls: ['./delivery-informations-steps-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsStepsFormComponent {
  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }

  public get deliverySteps(): FormArray {
    return this.controlContainer.control.get('deliverySteps') as FormArray;
  }

  public addStep() {
    this.deliverySteps.push(createStepFormGroup({ id: null, name: '', date: null }));
  }

  public removeStep(index: number) {
    this.deliverySteps.removeAt(index);
  }
}
