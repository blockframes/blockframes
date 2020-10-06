import { Pipe, PipeTransform } from '@angular/core';
import { NgModule } from '@angular/core';

@Pipe({ name: 'deepKey' })
export class DeepKeyPipe implements PipeTransform {
  transform(value: Object, deepKey: string) {
    if (!value) return;

    const conditions = deepKey.split('||').map(p => p.trim());
    const getDeepValue = (val: Object, condition: string) => condition.split('.').reduce((result, key) => result?.[key], val);
    
    if (Array.isArray(value)) {
      return value.map(obj => {
        const condition = conditions.find(c => !!getDeepValue(obj, c));
        return condition ? !!getDeepValue(obj, condition) : undefined;
      });
    } else {
      const condition = conditions.find(c => !!getDeepValue(value, c));
      return condition ? !!getDeepValue(value, condition) : undefined;
    }
  }
}

@NgModule({
  declarations: [DeepKeyPipe],
  exports: [DeepKeyPipe]
})
export class DeepKeyPipeModule { }