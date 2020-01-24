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

  /**
   * Use to apply patchAllValue to FormList
   * @note this method is specific from FormList and is not part and Angular FormArray interface
   */
  patchAllValue(
    value: Partial<T>,
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    } = {}
  ) {
    Object.keys(value).forEach(name => {
      if (this.controls[name]) {
        if (!!this.controls[name]['patchAllValue']) {
          this.controls[name]['patchAllValue'](value[name], {onlySelf: true, emitEvent: options.emitEvent});
        } else {
          this.controls[name].patchValue(value[name], {onlySelf: true, emitEvent: options.emitEvent});
        }
      }
    });
  }
}
