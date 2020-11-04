import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { staticModel, Scope } from '@blockframes/utils/static-model';

@Pipe({
  name: 'toLabel'
})
export class ToLabelPipe implements PipeTransform {
  transform(value: string | string[], scope: Scope): string | string[] {
    if (!value) return '';
    try {
      return Array.isArray(value) ? value.map(val => staticModel[scope][val]).join(', ') : staticModel[scope][value];
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
