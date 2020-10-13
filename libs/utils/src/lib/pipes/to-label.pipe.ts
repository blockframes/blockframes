import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { staticConsts } from '@blockframes/utils/static-model';
import { getValueByKey, Scope } from '../static-model/staticConsts';

export const formatKey = (key: string, scope: Scope) => key
  ? getValueByKey(scope, key.trim().toLocaleLowerCase())
  : '';

@Pipe({
  name: 'toLabel'
})
export class ToLabelPipe implements PipeTransform {
  transform(value: string, type: string): string {

    for (const key in staticConsts) {
      if(key === type) {
        if (Array.isArray(value)) {
          return value.map((v) => formatKey(v, key as Scope)).join(', ');
        }
        else return staticConsts[key][value];
      }
    }

    console.error(`Readonly object "${type}" not found`);
    return value;
  }
}


@NgModule({
  declarations: [ToLabelPipe],
  imports: [CommonModule],
  exports: [ToLabelPipe]
})
export class ToLabelModule {}
