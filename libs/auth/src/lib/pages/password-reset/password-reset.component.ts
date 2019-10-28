import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../+state';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'auth-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PasswordResetComponent implements OnInit, OnDestroy {

  public passwordForm: FormGroup;
  public actionCode: string;
  public actionCodeChecked: boolean;

  private destroyed = new Subject();

  constructor(
    private builder: FormBuilder,
    private service: AuthService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router) {}

  ngOnInit() {
    this.passwordForm = this.builder.group({
      new: ['', [Validators.required]]
    });
    this.route.queryParams
      .pipe(takeUntil(this.destroyed))
      .subscribe(params => {
        if (!params) this.router.navigate(['/layout']);
        this.actionCode = params['oobCode'];

        // Verify the password reset code is valid.
        try {
          this.service.getAuth().verifyPasswordResetCode(this.actionCode);
          this.actionCodeChecked = true;
        } catch (error) {
          // Invalid or expired action code. Ask user to try to reset the password again.
          this.snackBar.open(error.message, 'close', { duration: 3000});
          this.router.navigate(['/auth/connexion']);
        }
      })
  }

  /** Attempt to confirm the password reset with Firebase and navigate user back to login page. */
  public setNewPassword() {
    try {
      if (this.passwordForm.invalid) throw new Error('Your informations to change your password are not valid');
      console.log(this.actionCode)
      this.service.handleResetPassword(this.actionCode, this.passwordForm.value.new);
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
