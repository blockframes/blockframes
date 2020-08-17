import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { staticConsts } from '@blockframes/utils/static-model';

const registeredObjects = [
  'unitBox',
  'storeType',
  'storeStatus',
  'contentType',
  'contractStatus',
  'distributionRightStatus',
  'contractType',
  'orgActivity'
] as const;

export type Label = typeof registeredObjects[number];

@Pipe({
  name: 'toLabel'
})
export class ToLabelPipe implements PipeTransform {
  async transform(value: string, type: Label): Promise<string> {

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
