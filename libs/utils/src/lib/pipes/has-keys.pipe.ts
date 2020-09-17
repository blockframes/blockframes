import { CommonModule } from '@angular/common';
import { Pipe, PipeTransform, NgModule } from '@angular/core';

function hasValue(value: string | number | any[] | object) {
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
  transform(base: Record<string, any>, keys: string | string[], filter: 'every' | 'some' = 'some') {
    keys = Array.isArray(keys) ? keys : [keys];
    return keys[filter](key => {
      const value = key.split('.').reduce((result, key) => result[key], base);
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