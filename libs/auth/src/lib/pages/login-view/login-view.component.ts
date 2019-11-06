import { Component, ChangeDetectionStrategy, ViewChild, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthQuery } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSidenav } from '@angular/material/sidenav';
import { SignupForm } from '../../forms/signup.form';
import { SigninForm } from '../../forms/signin.form';

@Component({
  selector: 'auth-login-view',
  templateUrl: './login-view.component.html',
  styleUrls: ['./login-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginViewComponent {
  @HostBinding('attr.page-id') pageId = 'login-view';
  @ViewChild('signinSidenav', { static: false }) loginSidenav: MatSidenav;
  @ViewChild('signupSidenav', { static: false }) signupSidenav: MatSidenav;

  public isSignin = true;
  private snackbarDuration = 2000;

  constructor(
    private service: AuthService,
    private query: AuthQuery,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  public async signin(signinForm: SigninForm) {
    if (signinForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: this.snackbarDuration });
      return;
    }
    try {
      const { email, password } = signinForm.value;
      await this.service.signin(email, password);
      const route = this.query.requestedRoute || 'layout';
      this.router.navigate([route]);
    } catch (err) {
      console.error(err); // let the devs see what happened
      this.snackBar.open(err.message, 'close', { duration: this.snackbarDuration });
    }
  }

  public async signup(signupForm: SignupForm) {
    if (signupForm.invalid) {
      this.snackBar.open('Information not valid.', 'close', { duration: this.snackbarDuration });
      return;
    }
    try {
      const { email, password, name, surname } = signupForm.value;
      await this.service.signup(email, password, name, surname);
      const route = this.query.requestedRoute || 'layout';
      this.router.navigate([route]);
    } catch (err) {
      console.error(err); // let the devs see what happened
      this.snackBar.open(err.message, 'close', { duration: this.snackbarDuration });
    }
  }

  get align() {
    return this.isSignin ? 'end center' : 'start center';
  }
}
