import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { StaticGroup, GroupScope, staticGroups, staticModel } from '@blockframes/utils/static-model';

export function toGroupLabel(value: string[], scope: GroupScope, all?: string) {

  const groups: StaticGroup[] = staticGroups[scope];

  const allItems = groups.reduce((items, group) => items.concat(group.items), []);

  if (allItems.length === value.length) return [all];

  return groups.map(group => {
    const items = [];
    for (const item of group.items) {
      if (value.includes(item)) items.push(staticModel[scope][item]);
    }
    return items.length === group.items.length
      ? group.label
      : items;
  })
    .sort((a) => typeof a === 'string' ? -1 : 1)
    .flat()
    .filter(v => !!v);
}

@Pipe({ name: 'toGroupLabel' })
export class GroupLabel implements PipeTransform {
  transform(value: string[], scope: GroupScope, all?: string) {
    toGroupLabel(value, scope, all);
  }
}

@NgModule({
  exports: [GroupLabel],
  declarations: [GroupLabel]
})
export class ToGroupLabelPipeModule { }
