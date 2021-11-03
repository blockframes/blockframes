import { Component, ChangeDetectionStrategy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SigninForm } from '../../forms/signin.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'auth-login-view',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  @ViewChild('customSnackBarTemplate') customSnackBarTemplate: TemplateRef<unknown>;
  private snackbarDuration = 8000;

  public buttonText = 'Log in';

  constructor(
    private service: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Login')
  }

  public async signin(signinForm: SigninForm) {
    if (signinForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: this.snackbarDuration });
      return;
    }
    try {
      this.buttonText = 'Logging in...'
      const { email, password } = signinForm.value;
      await this.service.deleteAnonymousUser();
      await this.service.signin(email.trim(), password);
      // Reset page title to default
      this.dynTitle.setPageTitle();
      const redirectTo = localStorage.getItem('redirectTo');
      if (redirectTo) {
        localStorage.removeItem('redirectTo');
        this.router.navigate([redirectTo]);
      } else {
        this.router.navigate(['c']);
      }
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
}
