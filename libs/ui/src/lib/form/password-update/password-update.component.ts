import { Component, ChangeDetectionStrategy, Input, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UpdatePasswordForm } from '@blockframes/utils/form/controls/password.control';
import { RepeatPasswordStateMatcher, DifferentPasswordStateMatcher } from '@blockframes/utils/form/matchers';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
  selector: 'password-update',
  templateUrl: './password-update.component.html',
  styleUrls: ['./password-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PasswordUpdateComponent),
    multi: true
  }]
})
export class PasswordUpdateComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @Input() currentControl: FormControl;

  form: UpdatePasswordForm;

  passwordsMatcher = new RepeatPasswordStateMatcher('next', 'confirm');
  currentPasswordMatch = new DifferentPasswordStateMatcher('current', 'next');

  private subscription: Subscription;

  ngOnInit() {
    this.form = new UpdatePasswordForm(this.currentControl);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
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
    ).subscribe(value => isValid ? fn(value.next) : fn(''));
  }

  public registerOnTouched(fn: (touched: boolean) => void) {
    fn(true);
  }
}
