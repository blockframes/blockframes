import { Validator } from './types';
import { FormGroup, AbstractControl } from '@angular/forms';
import { defer, Observable } from 'rxjs';
import { shareReplay, startWith } from 'rxjs/operators';
import { FormList } from '.';

/** Generic EntityControl */
export type EntityControl<E = any> = {
  [key in keyof Partial<E>]: AbstractControl;
}

/** Generic FormGroup for Entity */
export class FormEntity<C extends EntityControl<T>, T = any> extends FormGroup {
  value: T;
  valueChanges: Observable<T>;
  controls: C;
  // defer the startWith value with subscription happens to get first value
  value$ = defer(() => this.valueChanges.pipe(
    startWith(this.value),
    shareReplay({ refCount: true, bufferSize: 1 }),
  ));

  createControl?: (value?: Partial<T>) => C
  static factory<E, Control extends EntityControl = any>(
    value: Partial<E>,
    createControl?: (value?: Partial<E>) => Control,
    validators?: Validator
  ): FormEntity<Control, E> {
    if (createControl) {
      const controls = createControl(value);
      const form = new FormEntity<Control, E>(controls, validators);
      form['createControl'] = createControl.bind(form);
      return form;
    }
    return new FormEntity<Control, E>({}, validators);
  }


  get<K extends keyof C>(path: Extract<K, string>): C[K] {
    return super.get(path) as C[K];
  }

  setControl<K extends keyof C>(path: Extract<K, string>, control: C[K]) {
    super.setControl(path, control);
  }

  /**
   * Use to apply patchAllValue to FormList and FormEntity
   * @note this method is specific from FormList and is not part and Angular FormGroup interface
   */
  patchAllValue(value: Partial<T> = {}) {
    const controls = this['createControl'] ? this.createControl(value) : {};
    for (const name in controls) {
      if (this.controls[name]) {
        if (this.controls[name]['patchAllValue']) {
          this.controls[name]['patchAllValue'](value[name]);
        } else {
          this.controls[name].patchValue(value[name]);
        }
      }
      else {
        if (this['createControl']) {
          this.addControl(name, controls[name])
        }
      }
    }
  }

  hardReset(values: Partial<T>={}){
    for (const [key, control] of Object.entries(this.controls)) {
      const value = values[key as keyof T] as any;
      if (control instanceof FormEntity || control instanceof FormList) {
        control.hardReset(value);
      } else if(control instanceof AbstractControl) {
        control.reset(value);
      }
    }
  }
}
