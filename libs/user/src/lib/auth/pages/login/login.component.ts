import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SigninForm } from '../../forms/signin.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { SnackbarLinkComponent } from '@blockframes/ui/snackbar/link/snackbar-link.component';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/error/snackbar-error.component';

@Component({
  selector: 'auth-login-view',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {

  public buttonText = $localize`Log in`;
  public signinIn = false;

  constructor(
    private service: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Login');
  }

  ngOnDestroy() {
    this.snackBar.dismiss();
  }

  public async signin(signinForm: SigninForm) {
    if (this.signinIn) return;
    if (signinForm.invalid) {
      this.snackBar.open($localize`Information not valid`, 'close', { duration: 8000 });
      return;
    }
    this.signinIn = true;
    try {
      this.buttonText = $localize`Logging in...`
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
      this.buttonText = $localize`Log in`;
      console.error(err); // let the devs see what happened
      if (err.message.includes('INTERNAL ASSERTION FAILED')) {
        this.snackBar.open('Network error. Please refresh this page.', 'close', { duration: 8000 });
      } else if (err.code === 'auth/user-not-found') {
        this.snackBar.openFromComponent(SnackbarLinkComponent, {
          data: {
            message: $localize`This account does not exist.`,
            link: ['/auth/identity'],
            linkName: 'CREATE ACCOUNT'
          },
          duration: 8000
        });
      } else if (err.code === 'auth/wrong-password') {
        this.snackBar.openFromComponent(SnackbarLinkComponent, {
          data: {
            message: $localize`Incorrect password`,
            link: ['auth/reset-password'],
            linkName: 'RESET PASSWORD'
          },
          duration: 8000
        });
      } else {
        this.snackBar.openFromComponent(SnackbarErrorComponent, { duration: 8000 });
      }
    }

    this.signinIn = false;
  }
}
