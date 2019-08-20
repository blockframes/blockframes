import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formGroupName] delivery-movie-material-form, [formGroup] delivery-movie-material-form, delivery-movie-material-form',
  templateUrl: './delivery-movie-material-form.component.html',
  styleUrls: ['./delivery-movie-material-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeliveryMovieMaterialFormComponent {

  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }
}
