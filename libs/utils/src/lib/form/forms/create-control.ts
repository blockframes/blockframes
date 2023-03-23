import { UntypedFormGroup, UntypedFormArray, UntypedFormControl } from '@angular/forms';

export function createControlForm(value: any) {
  if (Array.isArray(value)) {
    const controls = value.map(v => createControlForm(v));
    return new UntypedFormArray(controls);
    // return new FormList(value);
  } else if (typeof value === 'object') {
    const controls = Object.keys(value).reduce((acc, key) => ({
      ...acc,
      [key]: createControlForm(value[key])
    }), {})
    return new UntypedFormGroup(controls);
  } else if (typeof value === 'function') {
    throw new Error('Value cannot be a function');
  } else {
    return new UntypedFormControl(value);
  }
}
