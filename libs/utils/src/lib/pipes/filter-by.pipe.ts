import { Pipe, PipeTransform, NgModule } from '@angular/core';

@Pipe({ name: 'filterBy' })
export class FilterBy implements PipeTransform {
  transform<T>(items: T[], filter: (item: T) => boolean = (i) => true) {
    if (!items) return;
    return items.filter(filter);
  }
}

@NgModule({
  declarations: [FilterBy],
  exports: [FilterBy]
})
export class FilterByModule {}
