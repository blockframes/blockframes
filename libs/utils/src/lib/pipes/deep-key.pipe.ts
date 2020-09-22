import { Pipe, PipeTransform } from '@angular/core';
import { NgModule } from '@angular/core';

@Pipe({ name: 'deepKey' })
export class DeepKeyPipe implements PipeTransform {
  transform(value: Object, deepKey: string) {
    return deepKey.split('.').reduce((result, key) => result[key], value);
  }
}

@Pipe({ name: 'mapDeepKey' })
export class MapDeepKeyPipe implements PipeTransform {
  transform(value: Object[], deepKey: string) {
    return value.map(obj => deepKey.split('.').reduce((result, key) => result[key], obj));
  }
}

@NgModule({
  declarations: [DeepKeyPipe, MapDeepKeyPipe],
  exports: [DeepKeyPipe, MapDeepKeyPipe]
})
export class DeepKeyPipeModule { }