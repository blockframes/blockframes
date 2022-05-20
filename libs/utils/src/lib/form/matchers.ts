import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/** Error when the parent is invalid */
export class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.touched && form.invalid;
  }
}

/** Checks if two inputs have the same value */
export class RepeatPasswordStateMatcher implements ErrorStateMatcher {
  constructor(
    private password: string = 'password',
    private confirm: string = 'confirm'
  ) { }

  isErrorState(control: FormControl | null): boolean {
    if (control.touched && control.invalid) return true;
    return (control && control.parent.get(this.password).value !== control.parent.get(this.confirm).value && control.dirty);
  }
}

/** Check if two inputs have the same value (but inversed version of RepeatPasswordStateMatcher) */
export class DifferentPasswordStateMatcher implements ErrorStateMatcher {
  constructor(
    private current: string = 'current',
    private next: string = 'next'
  ) { }

  isErrorState(control: FormControl | null): boolean {
    if (control.touched && control.invalid) return true;
    return (control?.value && control.parent.get(this.current).value === control.parent.get(this.next).value && control.dirty);
  }
}
