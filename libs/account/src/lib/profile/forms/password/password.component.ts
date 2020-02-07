
import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formGroup] editPasswordForm, profile-password-form',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PasswordFormComponent {
  @HostBinding('attr.page-id') pageId = 'password-form';

  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }
}
