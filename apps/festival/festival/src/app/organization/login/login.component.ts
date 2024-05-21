import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { AuthService } from '@blockframes/auth/service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SnackbarLinkComponent } from '@blockframes/ui/snackbar/link/snackbar-link.component';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/error/snackbar-error.component';

@Component({
  selector: 'festival-organization-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationLoginComponent implements OnDestroy {
  public form = new UntypedFormGroup({
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(24)])
  });
  public buttonText = 'Log in';
  public signinIn = false;

  constructor(
    private service: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) { }

  ngOnDestroy(): void {
    this.snackBar.dismiss();
  }

  async validateLogin() {
    if (this.signinIn) return;
    if (!this.form.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }
    this.signinIn = true;
    try {
      this.buttonText = 'Logging in...';
      const { email, password } = this.form.value;
      this.service.updateAnonymousCredentials({}, { reset: true });
      await this.service.signin(email.trim(), password);

      // Redirect user to org view
      this.router.navigate(['../i'], { relativeTo: this.route });
    } catch (err) {
      this.buttonText = 'Log in';
      console.error(err); // let the devs see what happened
      if (err.message.includes('INTERNAL ASSERTION FAILED')) {
        this.snackBar.open('Network error. Please refresh this page.', 'close', { duration: 8000 });
      } else if (err.code === 'auth/user-not-found') {
        this.snackBar.openFromComponent(SnackbarLinkComponent, {
          data: {
            message: 'This account does not exist.',
            link: ['/auth/identity'],
            linkName: 'CREATE ACCOUNT'
          },
          duration: 8000
        });
      } else {
        this.snackBar.openFromComponent(SnackbarErrorComponent, { duration: 8000 });
      }
    }
    this.signinIn = false;
  }

  goBack() {
    this.service.updateAnonymousCredentials({ role: undefined });
    this.router.navigate(['../email'], { relativeTo: this.route });
  }

}
