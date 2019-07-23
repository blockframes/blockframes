import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formGroup] profileForm, profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileFormComponent {
  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }
}
