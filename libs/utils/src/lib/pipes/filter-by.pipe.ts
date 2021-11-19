import { Pipe, PipeTransform, NgModule } from '@angular/core';

@Pipe({ name: 'filterBy' })
export class FilterBy implements PipeTransform {
  transform<T>(items: T[], filter: (item: T, index: number, value: unknown) => boolean, config: unknown): T[] {
    return Array.isArray(items) ? items.filter((item, index) => filter(item, index, config)) : [];
  }
}

@NgModule({
  declarations: [FilterBy],
  exports: [FilterBy]
})
export class FilterByModule { }