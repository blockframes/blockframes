import { Component, ChangeDetectionStrategy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AuthService } from '@blockframes/auth/+state';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'event-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventLoginComponent implements OnInit {
  @ViewChild('customSnackBarTemplate') customSnackBarTemplate: TemplateRef<unknown>;
  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(24)])
  });
  public buttonText = 'Log in';
  private snackbarDuration = 8000;

  constructor(
    private service: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    const { email } = this.route.snapshot.queryParams;
    this.loginForm.get('email').setValue(email);
  }

  async validateLogin() {
    if (!this.loginForm.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }
    try {
      this.buttonText = 'Logging in...'
      const { email, password } = this.loginForm.value;
      this.service.updateAnonymousCredentials({}, { reset: true });
      await this.service.signin(email.trim(), password);

      // Redirect user to event view
      this.router.navigate(['../../r/i'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
    } catch (err) {
      this.buttonText = 'Log in';
      console.error(err); // let the devs see what happened
      if (err.message.includes('INTERNAL ASSERTION FAILED')) {
        this.snackBar.open('Network error. Please refresh this page.', 'close', { duration: this.snackbarDuration });
      } else if (err.code === 'auth/user-not-found') {
        this.snackBar.openFromTemplate(this.customSnackBarTemplate, { duration: this.snackbarDuration });
      } else {
        this.snackBar.open(err.message, 'close', { duration: this.snackbarDuration });
      }
    }
  }

  clickBack() {
    this.service.updateAnonymousCredentials({ role: undefined });
    this.router.navigate(['../../'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }
}
