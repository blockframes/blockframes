import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { staticConsts } from '@blockframes/utils/static-model';
import { Scope } from '../static-model/staticConsts';

@Pipe({
  name: 'toLabel'
})
export class ToLabelPipe implements PipeTransform {
  transform(value: string | string[], scope: Scope): string | string[] {
    try {
      return Array.isArray(value) ? value.map(val => staticConsts[scope][val]).join(', ') : staticConsts[scope][value];
    } catch (error) {
      console.error(`Could not find label for ${value}`)
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
