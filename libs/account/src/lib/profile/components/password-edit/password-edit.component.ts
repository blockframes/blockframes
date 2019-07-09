
import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PasswordControl, checkPasswords } from '@blockframes/utils';
import { AuthService } from '@blockframes/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'account-password-edit',
  templateUrl: './password-edit.component.html',
  styleUrls: ['./password-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PasswordEditEditComponent {
  @Output() closed = new EventEmitter();

  public form = new FormGroup({
    actualPassword: new PasswordControl(''),
    password: new PasswordControl(''),
    confirm: new PasswordControl('')
  },
  checkPasswords());

  constructor(private authService: AuthService, private snackBar: MatSnackBar) {}

  public async submitNewPassword() {
    if (this.form.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 2000 });
      return;
    }
    try {
      await this.authService.updatePassword(this.form.value.actualPassword, this.form.value.password);
      this.snackBar.open('Password change succesfull', 'close', { duration: 2000 });
    } catch (err) {
      console.error(err); // let the devs see what happened
      this.snackBar.open(err.message, 'close', { duration: 5000 });
    }

  }
}
