import { FormControl } from '@angular/forms';
import { Validator, AsyncValidator } from './types';

/** Field of an Entity */
export class FormField<T> extends FormControl {
  constructor(state: T, validators?: Validator, asyncValidators?: AsyncValidator) {
    super(state, validators, asyncValidators);
  }

  setValue(value: T, options?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
    emitModelToViewChange?: boolean;
    emitViewToModelChange?: boolean;
  }) {
    super.setValue(value, options);
  }

  patchValue(value: T, options?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
    emitModelToViewChange?: boolean;
    emitViewToModelChange?: boolean;
  }) {
    super.patchValue(value, options);
  }
}
