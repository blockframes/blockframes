import { UntypedFormControl, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

export class FormValue<T> extends UntypedFormControl {
  value: T;
  valueChanges: Observable<T>;
  constructor(value: T, validators?: ValidatorFn) {
    super(value, validators);
  }
}