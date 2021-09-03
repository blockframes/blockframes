import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { staticModel, Scope } from '@blockframes/utils/static-model';

export function toLabel(value: string | string[], scope: Scope): string | string[] {
  if (!value) return '';
  try {
    if (Array.isArray(value)) {
      return value.map(val => staticModel[scope][val]).join(', ')
    } else {
      // if no value is found return the input value to avoid unexpected empty values
      return staticModel[scope][value] ?? value;
    }
  } catch (error) {
    console.error(`Could not find label for key "${value}" in scope "${scope}"`);
    if (typeof value === 'string') return value;
    return '';
  }
}

@Pipe({ name: 'toLabel' })
export class ToLabelPipe implements PipeTransform {
  //@TODO #5530 remove limit and use css instead
  transform(value: string | null | undefined, scope: Scope): string
  transform(value: string[], scope: Scope): string[]
  transform(value: string | null | undefined | string[], scope: Scope): string | string[] {
    return toLabel(value, scope);
  }
}

@NgModule({
  declarations: [ToLabelPipe],
  imports: [CommonModule],
  exports: [ToLabelPipe]
})
export class ToLabelModule { }
