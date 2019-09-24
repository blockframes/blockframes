import { FormControl, FormGroupDirective, NgForm, FormArray, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

/** Checks if two inputs have the same value */
export class RepeatPasswordStateMatcher implements ErrorStateMatcher {
  private password: string;
  private confirm: string;

  constructor(password: string = 'password', confirm: string = 'confirm') {
    this.password = password;
    this.confirm = confirm;
  }

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return (control && control.parent.get(this.password).value !== control.parent.get(this.confirm).value && control.dirty)
  }
}

/** Checks if the sum of all percentages of FormArray does not exceed 100%  */
export class PercentageStateMatcher implements ErrorStateMatcher {
  private controlName: string;
  constructor(controlName: string) {
    this.controlName = controlName;
  }

  isErrorState(control: FormControl | null): boolean {
    let sum = 0;
    const array = control.parent.parent as FormArray;
    array.controls.forEach(group => sum += group.get(this.controlName).value);
    return (control && sum > 100);
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

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return (control && !!control.parent.get(this.first).value === true && !!control.parent.get(this.first).value === !!control.parent.get(this.second).value && control.dirty)
      || (control.dirty && control.parent.get(this.first).invalid || control.dirty && control.parent.get(this.second).invalid)
  }
}
