import { Pipe, PipeTransform } from '@angular/core';
import { NgModule } from '@angular/core';

@Pipe({ name: 'deepKey' })
export class DeepKeyPipe implements PipeTransform {
  transform(value: Object, deepKey: string) {
    try {
      if (!value) return;
      const getDeepValue = (val: Object) => deepKey.split('.')
        .reduce((result, key) => {
          if (!result) return;
          return result[key]
        }, val);

      if (Array.isArray(value)) {
        return value.map(obj => getDeepValue(obj)).filter(v => !!v);
      } else {
        return getDeepValue(value);
      }
    } catch(error) {
      console.warn('AN ERROR HAPPENED IN THE DeepKeyPipe');
      console.warn(error);
      return;
    }
  }
}

@NgModule({
  declarations: [DeepKeyPipe],
  exports: [DeepKeyPipe]
})
export class DeepKeyPipeModule { }
