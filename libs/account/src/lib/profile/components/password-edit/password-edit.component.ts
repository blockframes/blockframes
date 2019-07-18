
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '@blockframes/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PasswordControl } from '@blockframes/utils';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'account-password-edit',
  templateUrl: './password-edit.component.html',
  styleUrls: ['./password-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PasswordEditComponent {
  public form = new FormGroup({
    current: new PasswordControl(),
    next: new PasswordControl()
  });

  constructor(private authService: AuthService, private snackBar: MatSnackBar) {}

  public async update() {
    if (this.form.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 2000 });
      return;
    }
    try {
      await this.authService.updatePassword(this.form.value.current, this.form.value.next);
      this.snackBar.open('Password change succesfull', 'close', { duration: 2000 });
    } catch (err) {
      this.snackBar.open(err.message, 'close', { duration: 5000 });
    }
  }
}
