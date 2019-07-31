import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { Validator, AsyncValidator } from './types';
import { Observable } from 'rxjs';

/** Generic EntityControl */
export type EntityControl<T> = { [key in keyof Partial<T>]: FormControl | FormGroup | FormArray };

/** Generic FormGroup for Entity */
export class FormEntity<E, Control extends EntityControl<E> = EntityControl<E>> extends FormGroup {
  value: E;
  valueChanges: Observable<E>

  constructor(controls: Partial<Control>, validators?: Validator, asyncValidators?: AsyncValidator) {
    super(controls, validators, asyncValidators);
  }

  // static factory<E, Control extends EntityControl<E>>(entity: E, createControl?: (entity: E) => Control) {
  //   const form = new FormEntity<E, Control>({});
  //   if (createControl) {
  //     form['createControl'] = createControl.bind(form);
  //   }
  //   form.patchValue(entity);
  //   return form;
  // }

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
