import { FormControl, AbstractControl } from '@angular/forms';
import { FormArray, FormGroup } from '@angular/forms';
import { FormEntity } from './entity.form';
import { FormField } from './field.form';
import { Validator, AsyncValidator } from './types';

// type GetForm<T> = T extends FormField<any> ? T : T extends FormEntity<any, any> ? T : FormField<T>;

type GetValue<T> = T extends FormField<infer I> ? I : T extends FormEntity<infer J, any> ? J : T;

export function createControlForm(value: any) {
  if (Array.isArray(value)) {
    // return FormList.factory(value);
    return new FormList(value);
  } else if (typeof value === 'object') {
    // return FormEntity.factory(value);
    let form = {}
    for (const key in value) {
      form[key] = createControl(control[key]);
    }
    return new FormGroup(form);
  } else if (typeof value === 'function') {
    throw new Error('Value cannot be a function');
  } else {
    return new FormControl(value);
  }
}

/** A list of FormField */
export class FormList<T> extends FormArray {
  createControl =  createControlForm;

  constructor(controls: GetForm<T>[], validators?: Validator, asyncValidators?: AsyncValidator) {
    super(controls, validators, asyncValidators);
  }

  static factory<T, Control>(value: T[], createControl?: (value: T) => Control) {
    const form = new FormList<T>([]);
    if (createControl) {
      form['createControl'] = createControl.bind(form);
    }
    form.patchValue(value);
    return form;
  }

  // TODO(#691): impprove GetForm and GetValue
  // createControl(value: T): any{
  //   if (Array.isArray(value)) {
  //     // return FormList.factory(value);
  //     return new FormList(value);
  //   } else if (typeof value === 'object') {
  //     // return FormEntity.factory(value);
  //     let form = {}
  //     for (const key in value) {
  //       form[key] = this.createControl(control[key]);
  //     }
  //     return new FormGroup(form);
  //   } else if (typeof value === 'function') {
  //     throw new Error('Value cannot be a function');
  //   } else {
  //     return new FormControl(value);
  //   }
  // }

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
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
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
    if (this.length > value.length) {
      for (let i = value.length + 1; i++; i < this.length) {
        this.removeAt(i);
      }
    }
  }
}
