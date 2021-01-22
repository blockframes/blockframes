import { Pipe, PipeTransform, NgModule } from '@angular/core';

@Pipe({ name: 'filterBy' })
export class FilterBy implements PipeTransform {
  transform<T>(items: T[], filter: (item: T, index: number, value: unknown) => boolean, value: unknown) {
    return Array.isArray(items) ? items.filter((item, index) => filter(item, index, value)) : [];
  }
}

@NgModule({
  declarations: [FilterBy],
  exports: [FilterBy]
})
export class FilterByModule { }