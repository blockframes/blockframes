
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { EditPasswordForm } from '@blockframes/utils/form/controls/password.control';
import { DifferentPasswordStateMatcher, RepeatPasswordStateMatcher } from '@blockframes/utils/form/matchers';

@Component({
  selector: '[form] auth-form-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PasswordFormComponent {

  passwordsMatcher = new RepeatPasswordStateMatcher('next', 'confirm');
  currentPasswordMatch = new DifferentPasswordStateMatcher('current', 'next');

  @Input() form: EditPasswordForm;
  public hideCurrentPassword: boolean = true;
  public hideNewPassword: boolean = true;
  public hideConfirmationPassword: boolean = true;

  currentPasswordVisibility() {
    return this.hideCurrentPassword = !this.hideCurrentPassword
  }

  newPasswordVisibility() {
    return this.hideNewPassword = !this.hideNewPassword
  }

  confirmationPasswordVisibility() {
    return this.hideConfirmationPassword = !this.hideConfirmationPassword
  }

}
