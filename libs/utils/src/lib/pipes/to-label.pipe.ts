import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Scope, toLabel } from '@blockframes/model';

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
