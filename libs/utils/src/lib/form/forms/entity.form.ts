import { FormGroup, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';

/** Generic EntityControl */
export type EntityControl<E = any> = {
  [key in keyof Partial<E>]: AbstractControl;
}

/** Generic FormGroup for Entity */
export class FormEntity<C extends EntityControl<T>, T = any> extends FormGroup {
  value: T;
  valueChanges: Observable<T>;
  get<K extends keyof C>(path: Extract<K, string>): C[K] {
    return super.get(path) as C[K];
  }
}
