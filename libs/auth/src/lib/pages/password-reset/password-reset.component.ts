import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../+state';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export const enum UserManagementActions {
  resetPassword = 'resetPassword',
  verifyEmail = 'verifyEmail',
  recoverEmail = 'recoverEmail'
}

@Component({
  selector: 'auth-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PasswordResetComponent implements OnInit, OnDestroy {

  public passwordForm: FormGroup;
  public mode: string;
  public actionCode: string;
  public actionCodeChecked: boolean;

  private destroyed = new Subject<any>();

  constructor(
    private builder: FormBuilder,
    private service: AuthService,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private router: Router) {}

  ngOnInit() {
    this.passwordForm = this.builder.group({
      new: ['', [Validators.required]]
    });
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroyed))
      .subscribe(params => {
        if (!params) this.router.navigate(['/layout']);
        this.mode = params['mode'];
        this.actionCode = params['oobCode'];

        switch (params['mode']) {
          case UserManagementActions.resetPassword: {
            // Verify the password reset code is valid.
            try {
              this.service.getAuth().verifyPasswordResetCode(this.actionCode);
              this.actionCodeChecked = true;
            } catch (error) {
              // Invalid or expired action code. Ask user to try to reset the password again.
              this.snackBar.open(error.message, 'close', { duration: 3000});
              this.router.navigate(['/auth/connexion']);
            }
          }
          break;
          case UserManagementActions.recoverEmail: {
            // For future case, when we can handle email change in the blockchain side.
          }
          break;
          case UserManagementActions.verifyEmail: {
            // For future case, when we need to check user email.
          }
          break;
          default: {
            // If query parameters are missing, just go back to login page.
            this.router.navigate(['/auth/connexion']);
          }
        }
      })
  }

  /** Attempt to confirm the password reset with Firebase and navigate user back to login page. */
  public setNewPassword() {
    try {
      if (this.passwordForm.invalid) throw new Error('Your informations to change your password are not valid');
      console.log(this.actionCode)
      this.service.handleResetPassword(this.passwordForm.value.new, this.actionCode);
      this.router.navigate(['/auth/connexion']);
      this.snackBar.open('Password change succesfull', 'close', { duration: 5000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.unsubscribe();
  }
}
