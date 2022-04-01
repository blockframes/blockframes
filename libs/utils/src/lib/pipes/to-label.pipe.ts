import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toLabel } from '../utils';
import { Scope } from '@blockframes/shared/model';
export { toLabel } from '../utils';

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
