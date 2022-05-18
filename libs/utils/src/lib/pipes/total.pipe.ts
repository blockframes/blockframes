import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { sum } from '../utils';
import { getDeepValue } from './deep-key.pipe';

@Pipe({ name: 'total' })
export class TotalPipe implements PipeTransform {
  transform(data: unknown[], path: string): number {
    if (!data || !Array.isArray(data)) return 0;
    const validValues = data.map(element => getDeepValue(element, path))
      .filter(value => typeof value === 'number') as number[];
    return sum(validValues);
  }
}

@NgModule({
  declarations: [TotalPipe],
  exports: [TotalPipe]
})
export class TotalPipeModule { }
