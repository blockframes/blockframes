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
}
