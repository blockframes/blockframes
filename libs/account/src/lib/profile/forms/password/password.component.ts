
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ConfirmPasswordForm } from '@blockframes/utils/form/controls/password.control';
@Component({
  selector: '[form] profile-password-form',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PasswordFormComponent {

  @Input() form: ConfirmPasswordForm;
}
