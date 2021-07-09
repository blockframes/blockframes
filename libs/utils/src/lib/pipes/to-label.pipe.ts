import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { staticModel, Scope } from '@blockframes/utils/static-model';

@Pipe({ name: 'toLabel' })
export class ToLabelPipe implements PipeTransform {
  //@TODO #5530 remove limit and use css instead
  transform(value: string | null | undefined, scope: Scope): string
  transform(value: string[], scope: Scope): string[]
  transform(value: string | null | undefined | string[], scope: Scope): string | string[] {
    if (!value) return '';
    try {
      if (Array.isArray(value)) {
        return value.map(val => staticModel[scope][val]).join(', ')
      } else {
        return staticModel[scope][value];
      }
    } catch (error) {
      console.error(`Could not find label for key "${value}" in scope "${scope}"`);
      if (typeof value === 'string') return value;
      return '';
    }
  }
}

@NgModule({
  declarations: [ToLabelPipe],
  imports: [CommonModule],
  exports: [ToLabelPipe]
})
export class ToLabelModule { }
