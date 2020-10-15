import { FormControl, ValidatorFn } from '@angular/forms';
import { Scope as ConstantScope, GetKeys } from '../../static-model/staticConsts'
import { isKeyValidator, isKeyArrayValidator } from '../validators';
import { Observable } from 'rxjs';

// Form for static constant until we delete every static model
export class FormConstantValue<S extends ConstantScope> extends FormControl {
  value: GetKeys<S>;
  valueChanges: Observable<GetKeys<S>>;
  constructor(value: GetKeys<S>, scope: S, validators: ValidatorFn[] = []) {
    super(value, [isKeyValidator(scope), ...validators]);
  }
}

// Form array for static constant until we delete every static model
export class FormConstantArray<S extends ConstantScope> extends FormControl {
  value: GetKeys<S>[];
  valueChanges: Observable<GetKeys<S>[]>;
  constructor(value: GetKeys<S>[], scope: S, validators: ValidatorFn[] = []) {
    super(value, [isKeyArrayValidator(scope), ...validators]);
  }
}
