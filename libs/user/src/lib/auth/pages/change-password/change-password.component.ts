import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'auth-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  public passwordForm: UntypedFormGroup;
  public actionCode: string;
  public actionCodeChecked: boolean;

  private destroyed = new Subject();

  constructor(
    private builder: UntypedFormBuilder,
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
        if (!params) this.router.navigate(['/c']);
        this.actionCode = params['oobCode'];

        // Verify the password reset code is valid.
        try {
          this.service.checkResetCode(this.actionCode);
          this.actionCodeChecked = true;
        } catch (error) {
          // Invalid or expired action code. Ask user to try to reset the password again.
          this.snackBar.open(error.message, 'close', { duration: 3000});
          this.router.navigate(['/auth/connexion']);
        }
      })
  }

  /** Attempt to confirm the password reset with Firebase and navigate user back to login page. */
  public confirmPassword() {
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
    this.destroyed.next(null);
    this.destroyed.unsubscribe();
  }
}
