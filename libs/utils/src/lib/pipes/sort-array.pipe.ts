import { NgModule, Pipe, PipeTransform } from '@angular/core';

const sortFn = {
  random: () => Math.random() - .5
}
export type SortingOptions = 'default' | keyof typeof sortFn;
export const sortingOptions: SortingOptions[] = ['default', 'random'];


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
