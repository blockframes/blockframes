import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthQuery } from '../+state';
import { MatSnackBar } from '@angular/material';
import { SignupForm } from '../forms/signup.form';
import { SigninForm } from '../forms/signin.form';

@Component({
  selector: 'auth-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class AuthRootComponent implements OnInit {
  public signinForm: SigninForm;
  public signupForm: SignupForm;
  private snackbarDuration = 2000;

  constructor(
    private service: AuthService,
    private query: AuthQuery,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.signinForm = new SigninForm();
    this.signupForm = new SignupForm();
  }

  public async signin() {
    if (this.signinForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: this.snackbarDuration });
      return;
    }
    try {
      const { email, password } = this.signinForm.value;
      await this.service.signin(email, password);
      const route = this.query.requestedRoute || 'layout';
      this.router.navigate([route]);
    } catch (err) {
      console.error(err); // let the devs see what happened
      this.snackBar.open(err.message, 'close', { duration: this.snackbarDuration });
    }
  }

  public async signup() {
    if (this.signupForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: this.snackbarDuration });
      return;
    }
    try {
      const { email, password } = this.signupForm.value;
      await this.service.signup(email, password);
      const route = this.query.requestedRoute || 'layout';
      this.router.navigate([route]);
    } catch (err) {
      console.error(err); // let the devs see what happened
      this.snackBar.open(err.message, 'close', { duration: this.snackbarDuration });
    }
  }
}
