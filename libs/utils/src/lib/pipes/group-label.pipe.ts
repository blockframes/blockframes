import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { GroupScope, preferredLanguage, toGroupLabel } from '@blockframes/model';

@Pipe({ name: 'toGroupLabel' })
export class GroupLabel implements PipeTransform {
  transform(value: string[], scope: GroupScope, all?: string, i18n?: boolean) {
    const lang = i18n ? preferredLanguage() : undefined;
    return toGroupLabel(value, scope, all, lang);
  }
}

@NgModule({
  exports: [GroupLabel],
  declarations: [GroupLabel]
})
export class ToGroupLabelPipeModule { }
