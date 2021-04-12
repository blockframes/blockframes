import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { staticModel, Scope } from '@blockframes/utils/static-model';

@Pipe({
  name: 'toLabel'
})
export class ToLabelPipe implements PipeTransform {
  //@TODO #5530 remove limit and use css instead
  transform(value: string | string[], scope: Scope, limit?: number): string | string[] {
    if (!value) return '';
    try {
      if (Array.isArray(value)) {
        if (!!limit && value.length > limit) {
          const sliced = value.slice(0, limit).map(val => staticModel[scope][val]).join(', ')
          return `${sliced} and ${value.length - limit} more`
        } else {
          return value.map(val => staticModel[scope][val]).join(', ')
        }
      } else {
        return staticModel[scope][value];
      }
    } catch (error) {
      console.error(`Could not find label for key "${value}" in scope "${scope}"`)
      return value;
    }
  }
}

@NgModule({
  declarations: [ToLabelPipe],
  imports: [CommonModule],
  exports: [ToLabelPipe]
})
export class ToLabelModule { }
