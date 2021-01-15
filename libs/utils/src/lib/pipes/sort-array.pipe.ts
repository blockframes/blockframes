import { NgModule, Pipe, PipeTransform } from '@angular/core';

export type SortingOptions = 'default' | 'random';
export const sortingOptions: SortingOptions[] = ['default', 'random'];

@Pipe({ name: 'sortArrayBy' })
export class SortArrayByPipe implements PipeTransform {
  transform(array: any[], method: SortingOptions) {
    if (Array.isArray(array)) {
      if (method === 'random') {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
      }
    }
    return array;
  }
}

@NgModule({
  declarations: [SortArrayByPipe],
  exports: [SortArrayByPipe]
})
export class SortArrayPipeModule { }
