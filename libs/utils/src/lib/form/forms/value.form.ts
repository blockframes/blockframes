import { FormControl, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

export class FormValue<T> extends FormControl {
  value: T;
  valueChanges: Observable<T>;
  constructor(value: T, validators?: ValidatorFn) {
    super(value, validators);
  }
}