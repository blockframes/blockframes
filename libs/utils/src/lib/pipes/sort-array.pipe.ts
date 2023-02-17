import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { sortFn, SortingOptions } from '@blockframes/model';

@Pipe({ name: 'sortBy' })
export class SortByPipe implements PipeTransform {
  transform(array: unknown[], method: SortingOptions = 'default') {
    if (method === 'default' || !Array.isArray(array)) return array;
    return array.sort(sortFn[method]);
  }
}

@NgModule({
  declarations: [SortByPipe],
  exports: [SortByPipe]
})
export class SortByPipeModule { }
