import { Validator } from './types';
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
  controls: C;

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
    return new FormEntity<Control, E>({}, validators);;
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
  patchAllValue(
    value: Partial<T> = {},
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    } = {}
  ) {
    const controls = this['createControl'] ? this.createControl(value) : {};
    Object.keys(controls).forEach(name => {
      if (this.controls[name]) {
        if (!!this.controls[name]['patchAllValue']) {
          this.controls[name]['patchAllValue'](value[name], { onlySelf: true, emitEvent: options.emitEvent });
        } else {
          this.controls[name].patchValue(value[name], { onlySelf: true, emitEvent: options.emitEvent });
        }
      }
      else {
        if (this['createControl']) {
          this.addControl(name, controls[name])
        }
      }
    });
  }
}
