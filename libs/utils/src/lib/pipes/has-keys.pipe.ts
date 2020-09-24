import { CommonModule } from '@angular/common';
import { Pipe, PipeTransform, NgModule } from '@angular/core';

function hasValue(value: string | number | any[] | object) {
  if (!value) return false;
  if (Array.isArray(value)) {
    return !!value.length;
  } else if (typeof value === 'object') {
    return Object.values(value).some(hasValue);
  } else {
    return !!value;
  }
}

@Pipe({ name: 'hasKeys' })
export class HasKeysPipe implements PipeTransform {
  transform(base: Record<string, any>, keys: string | string[], filter: 'every' | 'some' = 'some'): boolean {
    if (!base) {
      return false;
    }
    keys = Array.isArray(keys) ? keys : [keys];
    if (!keys.length) {
      return true;
    }
    return keys[filter](key => {
      const value = key.split('.').reduce((result, k) => result[k], base);
      return hasValue(value);
    });
  }
}

@NgModule({
  declarations: [HasKeysPipe],
  exports: [HasKeysPipe],
  imports: [CommonModule]
})
export class HasKeysModule {}