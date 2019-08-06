import { FormGroup, FormArray, FormControl } from '@angular/forms';

export function createControlForm(value: any) {
  if (Array.isArray(value)) {
    const controls = value.map(v => createControlForm(v));
    return new FormArray(controls);
    // return new FormList(value);
  } else if (typeof value === 'object') {
    const controls = Object.keys(value).reduce((acc, key) => ({
      ...acc,
      [key]: createControlForm(value[key])
    }), {})
    return new FormGroup(controls);
  } else if (typeof value === 'function') {
    throw new Error('Value cannot be a function');
  } else {
    return new FormControl(value);
  }
}
