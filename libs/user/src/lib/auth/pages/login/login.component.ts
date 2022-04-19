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
  @ViewChild('wrongPasswordTemplate') wrongPasswordTemplate: TemplateRef<unknown>;

  public buttonText = 'Log in';
  public signinIn = false;

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
    if (this.signinIn) return;
    if (signinForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 8000 });
      return;
    }
    this.signinIn = true;
    try {
      this.buttonText = 'Logging in...'
      const { email, password } = signinForm.value;
      await this.service.signin(email.trim(), password);
      // Reset page title to default
      this.dynTitle.setPageTitle();
      const redirectTo = localStorage.getItem('redirectTo');
      if (redirectTo) {
        localStorage.removeItem('redirectTo');
        this.router.navigateByUrl(redirectTo);
      } else {
        this.router.navigate(['c']);
      }
    } catch (err) {
      this.buttonText = 'Log in';
      console.error(err); // let the devs see what happened
      if (err.message.includes('INTERNAL ASSERTION FAILED')) {
        this.snackBar.open('Network error. Please refresh this page.', 'close', { duration: 8000 });
      } else if (err.code === 'auth/user-not-found') {
        this.snackBar.openFromTemplate(this.customSnackBarTemplate, { duration: 8000 });
      } else if (err.code === 'auth/wrong-password') {
        this.snackBar.openFromTemplate(this.wrongPasswordTemplate, { duration: 8000 });
      } else {
        this.snackBar.open(err.message, 'close', { duration: 8000 });
      }
    }

    this.signinIn = false;
  }
}
