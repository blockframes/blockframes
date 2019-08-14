import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formGroupName] delivery-material-form, [formGroup] delivery-material-form, delivery-material-form',
  templateUrl: './delivery-material-form.component.html',
  styleUrls: ['./delivery-material-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryMaterialFormFormComponent {
  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }
}
