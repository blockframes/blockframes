import { AbstractControl } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { FormEntity } from './entity.form';
import { Validator, AsyncValidator } from './types';
import { createControlForm } from './create-control';
import { defer, Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';

type GetValue<T> = T extends FormEntity<infer J> ? J : T;

type GetPartial<T> = T extends Record<string, infer I> ? Partial<T> : T;

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
  createControl: (value?: Partial<T>, index?: number) => Control = createControlForm;
  controls: Control[];
  valueChanges: Observable<T[]>;
  value$ = defer(() => this.valueChanges.pipe(startWith(this.value)));

  private constructor(controls: Control[], validators?: Validator, asyncValidators?: AsyncValidator) {
    super(controls, validators, asyncValidators);
  }

  static factory<T, Control extends AbstractControl = any>(value: T[], createControl?: (value?: Partial<T>, index?: number) => Control, validators?: Validator): FormList<T, Control> {
    if (createControl) {
      const controls = Array.isArray(value) ? value.map(createControl) : [createControl(value, 0)];
      const form = new FormList<T>(controls, validators);
      form['createControl'] = createControl.bind(form);
      return form;
    } else {
      return new FormList<T>([], validators);
    }
  }

  /** Get value of item that has value */
  // Error: Error: 'value' is defined as a property in class 'FormArray', but is overridden here in 'FormList<T, Control>' as an accessor.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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

  /** Custom Method to get the last control */
  last(): Control {
    return this.at(this.length - 1);
  }

  /**
   * Custom method to add a Control using the createControl method
   */
  add(value?: GetPartial<T>): Control {
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
    value: Partial<T>[] = [],
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    } = {}
  ) {
    value.forEach((newValue, index) => {
      // If there is a form already patch it
      if (this.at(index)) {
        if (this.at(index).hasOwnProperty.call(this.at(index), 'patchAllValue')) {
          this.at(index)['patchAllValue'](newValue, {
            onlySelf: true,
            emitEvent: options.emitEvent
          });
        } else {
          this.setControl(index, this.createControl(newValue));
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

  hardReset(values: GetPartial<T>[]) {
    this.clear()
    values.forEach(value => this.add(value));
  }
}
