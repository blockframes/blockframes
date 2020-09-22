import { Pipe, PipeTransform } from '@angular/core';
import { NgModule } from '@angular/core';

@Pipe({ name: 'deepKey' })
export class DeepKeyPipe implements PipeTransform {
  transform(value: Object, deepKey: string) {
    if (!value) return;
    const getDeepValue = (val: Object) => deepKey.split('.').reduce((result, key) => result[key], val);

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