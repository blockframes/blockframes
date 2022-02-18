import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { GroupScope } from '@blockframes/utils/static-model';
import { toGroupLabel } from '../utils';

@Pipe({ name: 'toGroupLabel' })
export class GroupLabel implements PipeTransform {
  transform(value: string[], scope: GroupScope, all?: string) {
    return toGroupLabel(value, scope, all);
  }
}

@NgModule({
  exports: [GroupLabel],
  declarations: [GroupLabel]
})
export class ToGroupLabelPipeModule { }
