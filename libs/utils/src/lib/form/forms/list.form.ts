import { AbstractControl } from '@angular/forms';
import { FormArray, FormControl } from '@angular/forms';
import { FormEntity } from './entity.form';
import { Validator, AsyncValidator } from './types';
import { createControlForm } from './create-control';

type GetValue<T> = T extends FormEntity<infer J> ? J : T;

/** Check form content has a value given by the user */
function hasValue(v: any): boolean {
  if (Array.isArray(v)) {
    return v.some(i => hasValue(i));
  }
  if (v === null) {
    return false;
  }
  if (typeof v === 'object') {
    return Object.keys(v).some(k => hasValue(v[k]));
  } else if (typeof v === 'number') {
    return true;
  } else {
    return !!v
  }
}

/** A list of FormField */
export class FormList<T, Control extends AbstractControl = any> extends FormArray {
  private _value: T[];
  createControl: (value: T) => Control = createControlForm;
  controls: Control[];

  constructor(controls: Control[], validators?: Validator, asyncValidators?: AsyncValidator) {
    super(controls, validators, asyncValidators);
  }

  static factory<T, Control>(value: T[], createControl?: (value?: T) => Control, validators?: Validator) {
    const form = new FormList<T>([], validators);
    if (createControl) {
      form['createControl'] = createControl.bind(form);
    }
    if (!value.length) {
      const control = createControl ? createControl() : new FormControl();
      form.push(control);
    } else {
      form.patchValue(value);
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

  setValue(
    value: GetValue<T>[],
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ) {
    super.setValue(value, options);
  }

  patchValue(
    value: T[],
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    } = {}
  ) {
    value.forEach((newValue, index) => {
      // If there is a form already patch it
      if (this.at(index)) {
        this.at(index).patchValue(newValue, {
          onlySelf: true,
          emitEvent: options.emitEvent
        });
        // else create one
      } else {
        this.setControl(index, this.createControl(newValue));
      }
    });
    // If there is more value than form controls, remove it.
    while (this.length > value.length) {
      this.removeAt(this.length - 1);
    }
  }
}
