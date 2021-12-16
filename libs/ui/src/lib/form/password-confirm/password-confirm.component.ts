import { Component, ChangeDetectionStrategy, forwardRef, OnDestroy, OnInit, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ConfirmPasswordForm } from '@blockframes/utils/form/controls/password.control';
import { RepeatPasswordStateMatcher } from '@blockframes/utils/form/matchers';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
  selector: 'password-confirm',
  templateUrl: './password-confirm.component.html',
  styleUrls: ['./password-confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PasswordConfirmComponent),
    multi: true
  }]
})
export class PasswordConfirmComponent implements OnInit, OnDestroy, ControlValueAccessor {

  private subscription: Subscription;
  public form = new ConfirmPasswordForm();

  public passwordsMatcher: RepeatPasswordStateMatcher;

  private _oldPassword: string | undefined;
  @Input() set oldPassword(value: string | undefined) {
    this._oldPassword = value;
    this.newPasswordValidator(this.form.get('password').value)
  };

  ngOnInit() {
    this.passwordsMatcher = new RepeatPasswordStateMatcher('password', 'confirm');
    this.subscription = this.form.get('password').valueChanges.subscribe(password => {
      this.newPasswordValidator(password)
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * A users' current password cannot match their new password 
   * @param current Users' current password (e.g. invitation pass)
   * @param next Users' new password
   */
  newPasswordValidator(next: string) {
    const error = this._oldPassword && this._oldPassword === next
      ? { oldPasswordMatch: true }
      : null;
    this.form.get('password').setErrors(error);
  }

  //////////////////////////////
  /// CONTROL VALUE ACCESSOR ///
  //////////////////////////////

  public writeValue(password: string): void {
    this.form.patchValue({ password });
  }

  public registerOnChange(fn: (value: string) => unknown): void {
    let isValid = false;
    this.subscription = this.form.valueChanges.pipe(
      distinctUntilChanged(() => this.form.valid === isValid),
      tap(() => isValid = this.form.valid),
    ).subscribe(value => isValid ? fn(value.password) : fn(''));
  }

  public registerOnTouched(fn: (touched: boolean) => void) {
    fn(true);
  }
}
