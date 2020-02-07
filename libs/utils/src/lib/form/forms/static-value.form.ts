import { FormControl, ValidatorFn } from '@angular/forms';
import { Scope, ExtractSlug } from '../../static-model/staticModels'
import { isSlugValidator, isSlugArrayValidator } from '../validators';
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
