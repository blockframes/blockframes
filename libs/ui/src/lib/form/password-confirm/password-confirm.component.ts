import { Component, ChangeDetectionStrategy, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ConfirmPasswordForm, RepeatPasswordStateMatcher } from '@blockframes/utils';
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

  ngOnInit() {
    this.passwordsMatcher = new RepeatPasswordStateMatcher('password', 'confirm');
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  //////////////////////////////
  /// CONTROL VALUE ACCESSOR ///
  //////////////////////////////

  public writeValue(password: string): void {
    this.form.patchValue({ password });
  }

  public registerOnChange(fn: (value: string) => any): void {
    let isValid = false;
    this.subscription = this.form.valueChanges.pipe(
      distinctUntilChanged(() => this.form.valid === isValid),
      tap(_ => isValid = this.form.valid),
    ).subscribe(value => {
      isValid ? fn(value.password) : fn('');
    });
  }

  public registerOnTouched(fn: any) {
    fn(true)
  }
}
