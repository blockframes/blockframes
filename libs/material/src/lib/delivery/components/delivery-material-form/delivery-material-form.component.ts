import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { Step } from '../../+state';

@Component({
  selector: '[formGroupName] delivery-material-form, [formGroup] delivery-material-form, delivery-material-form',
  templateUrl: './delivery-material-form.component.html',
  styleUrls: ['./delivery-material-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeliveryMaterialFormComponent{
  @Input() steps: Step[];
  @Output() delete = new EventEmitter<string>();

  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }

}
