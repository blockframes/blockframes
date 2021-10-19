import { CommonModule } from '@angular/common';
import { Pipe, PipeTransform, NgModule } from '@angular/core';

export function hasValue(value: string | number | unknown[] | unknown) {
  if (!value) return false;
  if (Array.isArray(value)) {
    return !!value.length;
  } else if (typeof value === 'object' && !(value instanceof Date)) {
    return Object.values(value).some(hasValue);
  } else {
    return !!value;
  }
}

@Pipe({ name: 'hasKeys' })
export class HasKeysPipe implements PipeTransform {
  transform(base: Record<string, unknown>, keys: string | string[], filter: 'every' | 'some' = 'some'): boolean {
    if (!base) {
      return false;
    }
    keys = Array.isArray(keys) ? keys : [keys];
    if (!keys.length) {
      return true;
    }
    return keys[filter](key => {
      const value = key.split('.').reduce((result, k) => {
        if (result) return result[k]
        return null
      }, base);
      return hasValue(value);
    });
  }
}

@NgModule({
  declarations: [HasKeysPipe],
  exports: [HasKeysPipe],
  imports: [CommonModule]
})
export class HasKeysModule { }
