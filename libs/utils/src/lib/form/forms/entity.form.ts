import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { Validator, AsyncValidator } from './types';

/** Generic EntityControl */
export type EntityControl<T> = { [key in keyof T]: FormControl | FormGroup | FormArray };

/** Generic FormGroup for Entity */
export class FormEntity<E, Control extends EntityControl<E>> extends FormGroup {
  constructor(controls: Control, validators?: Validator, asyncValidators?: AsyncValidator) {
    super(controls, validators, asyncValidators);
  }

  get<K extends keyof E>(path: Extract<K, string>): Control[K] {
    return super.get(path) as Control[K];
  }

  addControl<K extends keyof E>(name: Extract<K, string>, control: Control[K]) {
    super.addControl(name, control);
  }

  removeControl(name: Extract<keyof E, string>) {
    super.removeControl(name);
  }

  setControl<K extends keyof E>(name: Extract<K, string>, control: Control[K]) {
    super.setControl(name, control);
  }

  setValue(value: Partial<E>, options?: { onlySelf?: boolean; emitEvent?: boolean }) {
    super.setValue(value, options);
  }

  patchValue(value: Partial<E>, options?: { onlySelf?: boolean; emitEvent?: boolean }) {
    super.patchValue(value, options);
  }
}
