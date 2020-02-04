import { AbstractControl } from '@angular/forms';
import { FormArray, FormControl } from '@angular/forms';
import { FormEntity } from './entity.form';
import { Validator, AsyncValidator } from './types';
import { createControlForm } from './create-control';
import { Observable } from 'rxjs';

type GetValue<T> = T extends FormEntity<infer J> ? J : T;

/** Check form content has a value given by the user */
function hasValue(value: any): boolean {
  if (Array.isArray(value)) {
    return value.some(item => hasValue(item));
  }
  if (value === null) {
    return false;
  }
  if (typeof value === 'object') {
    return Object.keys(value).some(key => hasValue(value[key]));
  } else if (typeof value === 'number') {
    return true;
  } else {
    return !!value
  }
}

/** A list of FormField */
export class FormList<T, Control extends AbstractControl = any> extends FormArray {
  private _value: T[];
  createControl: (value: Partial<T>) => Control = createControlForm;
  controls: Control[];
  valueChanges: Observable<T[]>;

  constructor(controls: Control[], validators?: Validator, asyncValidators?: AsyncValidator) {
    super(controls, validators, asyncValidators);
  }

  static factory<T, Control extends AbstractControl = any>(value: T[], createControl?: (value?: Partial<T>) => Control, validators?: Validator): FormList<T, Control> {
    const form = new FormList<T>([], validators);
    if (createControl) {
      form['createControl'] = createControl.bind(form);
    }
    if (!value || !value.length) {
      form.add();
    } else {
      value.forEach(v => form.add(v))
    }
    return form;
  }

  /** Get value of item that has value */
  get value() {
    return this._value.filter((value: T) => hasValue(value));
  }

  set value(v: T[]) {
    this._value = v;
  }

  at(index: number): Control {
    return super.at(index) as Control;
  }

  push(control: Control) {
    super.push(control);
  }

  insert(index: number, control: Control) {
    super.insert(index, control);
  }

  setControl(index: number, control: Control) {
    super.setControl(index, control);
  }

  /**
   * Custom method to add a Control using the createControl method
   */
  add(value?: Partial<T>) {
    const control = this.createControl(value);
    this.push(control);
    return control;
  }

  setValue(
    value: GetValue<T>[],
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ) {
    super.setValue(value, options);
  }

  /**
   * Add, remove and update controles to match the value
   * @note this method is specific from FormList and is not part and Angular FormArray interface
   */
  patchAllValue(
    value: Partial<T>[],
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    } = {}
  ) {
    value.forEach((newValue, index) => {
      // If there is a form already patch it
      if (this.at(index)) {
        if (this.at(index)['patchAllValue']) {
          this.at(index)['patchAllValue'](newValue, {
            onlySelf: true,
            emitEvent: options.emitEvent
          });
        } else {
          this.at(index).patchValue(newValue, {
            onlySelf: true,
            emitEvent: options.emitEvent
          });
        }
        // else create one
      } else {
        this.setControl(index, this.createControl(newValue));
      }
    });
    // If there is more value than form controls, remove it.
    while (this.length > value.length) {
      this.removeAt(this.length - 1);
    }

    // We always want to have one form by default in the list
    if (this.length === 0) {
      this.add();
    }
  }

  /** 
   * 
   * @note This method was previously overrided. If you want set the exacte value (add, edit & remove) use patchAllValue
   */
  patchValue(
    value: Partial<T>[],
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    } = {}
  ) {
    super.patchValue(value, options)
  }
}
