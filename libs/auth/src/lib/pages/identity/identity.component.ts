import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthService, AuthQuery } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PasswordControl } from '@blockframes/utils/form/controls/password.control';

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
    email: new FormControl({ value: this.query.user.email, disabled: true }),
    generatedPassword: new FormControl(''),
    newPassword: new PasswordControl()
  });

  public isTermsChecked: boolean;

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
      await this.service.updatePassword(
        this.form.get('generatedPassword').value,
        this.form.get('newPassword').value
      );
      const uid = this.query.userId;
      await this.service.update({
        name: this.form.get('name').value,
        surname: this.form.get('surname').value,
      });
      this.router.navigate(['/c']);
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }

  /** Check the value of the boolean outputed by TermsAndConditionsComponent */
  public checkTermsOfUse(checked: boolean) {
    this.isTermsChecked = checked;
  }
}
