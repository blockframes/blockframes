import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService, AuthQuery } from '../+state';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'auth-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class AuthRootComponent implements OnInit {
  public signinForm: FormGroup;
  public signupForm: FormGroup;
  private snackbarDuration = 2000;

  constructor(
    private builder: FormBuilder,
    private service: AuthService,
    private query: AuthQuery,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.signinForm = this.builder.group({
      email: ['', Validators.required],
      pwd: ['', Validators.required]
    });
    this.signupForm = this.builder.group({
      email: ['', Validators.required],
      pwd: ['', Validators.required],
      confirm: ['', Validators.required]
    });
  }

  public async signin() {
    if (this.signinForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: this.snackbarDuration });
      return;
    }
    try {
      const { email, pwd } = this.signinForm.value;
      await this.service.signin(email, pwd);
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
      const { email, pwd } = this.signupForm.value;
      await this.service.signup(email, pwd);
      const route = this.query.requestedRoute || 'layout';
      this.router.navigate([route]);
    } catch (err) {
      console.error(err); // let the devs see what happened
      this.snackBar.open(err.message, 'close', { duration: this.snackbarDuration });
    }
  }
}
