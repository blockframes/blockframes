import { FormControl, ValidatorFn } from '@angular/forms';
import { Scope, ExtractSlug } from '../../static-model/staticModels'
import { Scope as ConstantScope, GetKeys } from '../../static-model/staticConsts'
import { isSlugValidator, isSlugArrayValidator, isKeyValidator } from '../validators';
import { Observable } from 'rxjs';

export class FormStaticValue<S extends Scope> extends FormControl {
  value: ExtractSlug<S>;
  valueChanges: Observable<ExtractSlug<S>>;
  constructor(value: ExtractSlug<S>, scope: S, validators: ValidatorFn[] = []) {
    super(value, [isSlugValidator(scope), ...validators]);
  }
}

export class FormStaticArray<S extends Scope> extends FormControl {
  value: ExtractSlug<S>[];
  valueChanges: Observable<ExtractSlug<S>[]>;
  constructor(value: ExtractSlug<S>[], scope: S, validators: ValidatorFn[] = []) {
    super(value, [isSlugArrayValidator(scope), ...validators]);
  }
}

// Form for static constant until we delete every static model
export class FormConstantValue<S extends ConstantScope> extends FormControl {
  value: GetKeys<S>;
  valueChanges: Observable<GetKeys<S>>;
  constructor(value: GetKeys<S>, scope: S, validators: ValidatorFn[] = []) {
    super(value, [isKeyValidator(scope), ...validators]);
  }
}
