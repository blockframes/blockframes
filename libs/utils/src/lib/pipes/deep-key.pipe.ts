import { Pipe, PipeTransform } from '@angular/core';
import { NgModule } from '@angular/core';
import * as objPath from 'object-path';

@Pipe({ name: 'deepKey' })
export class DeepKeyPipe implements PipeTransform {
  transform(value: Object, deepKey: string) {
    if (!value) return;

    const getDeepValue = (val: Object) => {
      const deepKeys = deepKey.split('||').map(p => p.trim());
      const usedKey = deepKeys.find(key => objPath.has(val, key));
      return objPath.get(val, usedKey);
    };

    if (Array.isArray(value)) {
      return value.map(obj => getDeepValue(obj));
    } else {
      return getDeepValue(value);
    } 
  }
}

@NgModule({
  declarations: [DeepKeyPipe],
  exports: [DeepKeyPipe]
})
export class DeepKeyPipeModule { }