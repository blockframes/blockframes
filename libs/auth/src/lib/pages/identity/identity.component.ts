import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthService, AuthQuery } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PasswordControl } from '@blockframes/utils';

@Component({
  selector: 'auth-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentityComponent {
  public form = new FormGroup({
    name: new FormControl(''),
    surname: new FormControl(''),
    avatar: new FormControl(''),
    email: new FormControl({ value: this.query.getValue().user.email, disabled: true }),
    generatedPassword: new FormControl(''),
    newPassword: new PasswordControl(),
  });

  constructor(
    private service: AuthService,
    private query: AuthQuery,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  public async update() {
    if (this.form.invalid) {
      this.snackBar.open('Please enter valid name and surname', 'close', { duration: 2000 });
      return;
    }
    try {
      const uid = this.query.userId;
      await this.service.update(uid, this.form.value);
      this.router.navigate(['auth/congratulation']);
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }
}
