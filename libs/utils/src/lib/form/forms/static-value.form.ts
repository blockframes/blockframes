import { UntypedFormControl, ValidatorFn } from '@angular/forms';
import { Scope, GetKeys } from '@blockframes/model';
import { isKeyValidator, isKeyArrayValidator } from '../validators';
import { Observable } from 'rxjs';

export class FormStaticValue<S extends Scope> extends UntypedFormControl {
  value: GetKeys<S>;
  valueChanges: Observable<GetKeys<S>>;
  constructor(value: GetKeys<S>, scope: S, validators: ValidatorFn[] = []) {
    super(value, [isKeyValidator(scope), ...validators]);
  }
}

export class FormStaticValueArray<S extends Scope> extends UntypedFormControl {
  value: GetKeys<S>[];
  valueChanges: Observable<GetKeys<S>[]>;
  constructor(value: GetKeys<S>[], scope: S, validators: ValidatorFn[] = []) {
    super(value, [isKeyArrayValidator(scope), ...validators]);
  }

  reset(value: S[] = []) {
    super.reset(value);
    this.markAsPristine();
  }
}
