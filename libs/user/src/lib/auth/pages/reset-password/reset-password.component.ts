import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../../service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarLinkComponent } from '@blockframes/ui/snackbar/link/snackbar-link.component';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/error/snackbar-error.component';

@Component({
  selector: 'auth-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {
  public emailForm: FormGroup;
  public submitted = false;

  constructor(
    private builder: FormBuilder,
    private service: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.emailForm = this.builder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  public async resetPassword() {
    try {
      if (this.emailForm.invalid) {
        this.snackBar.open('Incorrect email address', 'close', { duration: 5000 });
      } else {
        const res = await this.service.resetPasswordInit(this.emailForm.value.email);
        if (res.error === 'auth/email-not-found') {
          this.snackBar.openFromComponent(SnackbarLinkComponent, {
            data: {
              message: 'This account does not exist.',
              link: ['/auth/identity'],
              linkName: 'CREATE ACCOUNT'
            },
            duration: 8000
          });
        } else if (res.error) {
          this.snackBar.openFromComponent(SnackbarErrorComponent, { duration: 5000 });
        } else {
          this.snackBar.open('A password reset link has been sent to your email address', 'close', { duration: 5000 });
          this.submitted = true;
        }
      }
    } catch (err) {
      this.snackBar.openFromComponent(SnackbarErrorComponent, { duration: 5000 });
    }
  }
}
