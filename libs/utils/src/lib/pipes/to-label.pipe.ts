import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Scope, preferredLanguage, toLabel } from '@blockframes/model';

@Pipe({ name: 'toLabel' })
export class ToLabelPipe implements PipeTransform {
  //@TODO #5530 remove limit and use css instead
  transform(value: string | null | undefined, scope: Scope, i18n?: boolean): string
  transform(value: string[], scope: Scope, i18n?: boolean): string[]
  transform(value: string | null | undefined | string[], scope: Scope, i18n?: boolean): string | string[] {
    const lang = i18n ? preferredLanguage() : undefined;
    return toLabel(value, scope, undefined, undefined, lang);
  }
}

@NgModule({
  declarations: [ToLabelPipe],
  imports: [CommonModule],
  exports: [ToLabelPipe]
})
export class ToLabelModule { }
