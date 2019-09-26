import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { PasswordControl } from '@blockframes/utils/form';

@Component({
  selector: 'wallet-create-password-form',
  templateUrl: './wallet-create-password-form.component.html',
  styleUrls: ['./wallet-create-password-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletCreatePasswordFormComponent {
  public password = new PasswordControl();

  /** An event that will send the setted password by the user */
  @Output() userPassword: EventEmitter<string> = new EventEmitter();

  public submitPassword(){
    this.userPassword.emit(this.password.value);
  }
}
