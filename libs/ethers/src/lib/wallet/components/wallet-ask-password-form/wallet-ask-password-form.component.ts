import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { PasswordControl } from '@blockframes/utils/form';

@Component({
  selector: 'wallet-ask-password-form',
  templateUrl: './wallet-ask-password-form.component.html',
  styleUrls: ['./wallet-ask-password-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletAskPasswordFormComponent {
  public password = new PasswordControl();

  /** An event that will send the setted password by the user */
  @Output() userPassword = new EventEmitter();

  /** An event that will notify the parent component that the user forgot his password */
  @Output() forgotPassword = new EventEmitter();
}
