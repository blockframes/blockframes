import { FormGroup, AbstractControl } from '@angular/forms';

/** Generic EntityControl */
export type EntityControl<E = any> = {
  [key in keyof Partial<E>]: AbstractControl;
}

/** Generic FormGroup for Entity */
export class FormEntity<C extends EntityControl<C>> extends FormGroup {
  get<K extends keyof C>(path: Extract<K, string>): C[K] {
    return super.get(path) as C[K];
  }

  // addControl<K extends keyof C>(name: Extract<K, string>, control: C[K]) {
  //   super.addControl(name, control);
  // }

  // removeControl(name: Extract<keyof C, string>) {
  //   super.removeControl(name);
  // }

  // setControl<K extends keyof C>(name: Extract<K, string>, control: C[K]) {
  //   super.setControl(name, control);
  // }

  // setValue(value: Partial<C>, options?: { onlySelf?: boolean; emitEvent?: boolean }) {
  //   super.setValue(value, options);
  // }

  // patchValue(entity: Entity<C>, options?: { onlySelf?: boolean; emitEvent?: boolean }) {
  //   super.patchValue(entity, options);
  // }
}
