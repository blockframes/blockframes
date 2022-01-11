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
  private password: string;
  private confirm: string;

  constructor(password: string = 'password', confirm: string = 'confirm') {
    this.password = password;
    this.confirm = confirm;
  }

  isErrorState(control: FormControl | null): boolean {
    return (control && control.parent.get(this.password).value !== control.parent.get(this.confirm).value && control.dirty)
  }
}

/** Check if two inputs have the same value (but inversed version of RepeatPasswordStateMatcher) */
export class DifferentPasswordStateMatcher implements ErrorStateMatcher {
  constructor(
    private current: string = 'current',
    private next: string = 'next'
  ) {}

  isErrorState(control: FormControl | null): boolean {
    return (control?.value && control.parent.get(this.current).value === control.parent.get(this.next).value && control.dirty);
  }
}


/** Checks if two input are not both setted */
export class XorControlsStateMatcher implements ErrorStateMatcher {
  private first: string;
  private second: string;

  constructor(first: string = 'first', second: string = 'second') {
    this.first = first;
    this.second = second;
  }

  isErrorState(control: FormControl | null): boolean {
    return (control && !!control.parent.get(this.first).value === true && !!control.parent.get(this.first).value === !!control.parent.get(this.second).value && control.dirty)
      || (control.dirty && control.parent.get(this.first).invalid || control.dirty && control.parent.get(this.second).invalid)
  }
}
