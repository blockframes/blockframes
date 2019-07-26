import { FormControl } from '@angular/forms';
import { FormArray, FormGroup } from '@angular/forms';
import { FormEntity } from './entity.form';
import { FormField } from './field.form';
import { Validator, AsyncValidator } from './types';

type GetForm<T> = T extends FormField<any> ? T : T extends FormEntity<any, any> ? T : FormField<T>;

type GetValue<T> = T extends FormField<infer I> ? I : T extends FormEntity<infer J, any> ? J : T;

/** A list of FormField */
export class FormList<T> extends FormArray {
  constructor(controls: GetForm<T>[], validators?: Validator, asyncValidators?: AsyncValidator) {
    super(controls, validators, asyncValidators);
  }

  static factory<T, Control>(value: T[], createControl: (value: T) => Control) {
    const form = new FormList<T>([]);
    form['createControl'] = createControl.bind(form);
    form.patchValue(value);
    return form;
  }

  // TODO(#691): impprove GetForm and GetValue
  createControl(value: T): any{
    if (Array.isArray(value)) {
      return new FormList(value);
    } else if (typeof value === 'object') {
      return new FormGroup(value as any);
    } else if (typeof value === 'function') {
      throw new Error('Value cannot be a function');
    } else {
      return new FormControl(value);
    }
  }

  at(index: number): GetForm<T> {
    return super.at(index) as GetForm<T>;
  }

  push(control: GetForm<T>) {
    super.push(control);
  }

  insert(index: number, control: GetForm<T>) {
    super.insert(index, control);
  }

  setControl(index: number, control: GetForm<T>) {
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
  /* super.patchValue(value, options);} */
}
