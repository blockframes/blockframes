import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { StaticGroup } from '../static-model';

export type GroupMode = 'indeterminate' | 'checked' | 'unchecked';

function getMode(group: StaticGroup, value: string[]): GroupMode {
  const items = group.items.filter(item => value.includes(item));
  if (!items.length) return 'unchecked';
  if (items.length === group.items.length) return 'checked';
  return 'indeterminate';
}

function getRootMode(groups: StaticGroup[], value: string[]): GroupMode {
  if (!value.length) return 'unchecked';
  if (groups.every(group => getMode(group, value) === 'checked')) return 'checked';
  return 'indeterminate';
}

@Pipe({ name: 'getMode' })
export class GetModePipe implements PipeTransform {
  transform(value: string[], group: StaticGroup | StaticGroup[]) {
    if (Array.isArray(group)) return getRootMode(group, value);
    return getMode(group, value);
  }
}

@NgModule({
  exports: [GetModePipe],
  declarations: [GetModePipe]
})
export class GetModePipeModule { }
