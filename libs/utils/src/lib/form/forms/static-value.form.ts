import { FormControl, ValidatorFn } from '@angular/forms';
import { default as staticModel, Scope } from '../../static-model/staticModels'
import { isSlugValidator } from '../validators';
import { Observable } from 'rxjs';

export class FormStaticValue<T> extends FormControl {
  value: T;
  valueChanges: Observable<T>;
  constructor(value: T, scope: Scope, validators: ValidatorFn[] = []) {
    super(value, [isSlugValidator(scope), ...validators]);
  }
}