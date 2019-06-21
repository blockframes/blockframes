import { FormArray } from '@angular/forms';
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
    value: GetValue<T>[],
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ) {
    super.patchValue(value, options);
  }
}
