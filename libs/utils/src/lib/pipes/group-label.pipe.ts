import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Scope, StaticGroup, staticModel } from '@blockframes/utils/static-model';

@Pipe({ name: 'toGroupLabel' })
export class GroupLabel implements PipeTransform {
  transform(value: string[], groups: StaticGroup[], scope: Scope, all?: string) {
    const allItems = groups.reduce((items, group) => items.concat(group.items), []);
    if (allItems.length === value.length) return all;
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
      .map(item => typeof item === 'string' ? item : item.join(', '))
      .filter(v => !!v)
      .join(', ');
  }
}

@NgModule({
  exports: [GroupLabel],
  declarations: [GroupLabel]
})
export class ToGroupLabelPipeModule { }
