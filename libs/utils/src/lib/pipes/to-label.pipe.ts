import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { staticConsts } from '@blockframes/utils/static-model';

@Pipe({
  name: 'toLabel'
})
export class ToLabelPipe implements PipeTransform {
  transform(value: string, type: string): string {

    for (const key in staticConsts) {
      if(key === type) {
        return staticConsts[key][value];
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
