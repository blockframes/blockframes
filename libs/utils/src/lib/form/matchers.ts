import { UntypedFormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/** Error when the parent is invalid */
export class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.touched && form.invalid;
  }
}

/** Checks if two inputs have the same value */
export class RepeatPasswordStateMatcher implements ErrorStateMatcher {
  constructor(
    private password = 'password',
    private confirm = 'confirm'
  ) { }

  isErrorState(control: UntypedFormControl | null): boolean {
    if (control.touched && control.invalid) return true;
    return (control && control.parent.get(this.password).value !== control.parent.get(this.confirm).value && control.dirty);
  }
}

/** Check if two inputs have the same value (but inversed version of RepeatPasswordStateMatcher) */
export class DifferentPasswordStateMatcher implements ErrorStateMatcher {
  constructor(
    private current = 'current',
    private next = 'next'
  ) { }

  isErrorState(control: UntypedFormControl | null): boolean {
    if (control.touched && control.invalid) return true;
    return (control?.value && control.parent.get(this.current).value === control.parent.get(this.next).value && control.dirty);
  }
}