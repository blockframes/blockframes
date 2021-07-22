import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { getDeepValue } from './deep-key.pipe';

@Pipe({ name: 'total' })
export class TotalPipe implements PipeTransform {
  transform(data: unknown[], path: string): number {
    if (!data || !Array.isArray(data)) return 0;
    const validValues = data.map(element => getDeepValue(element, path))
      .filter(value => typeof value === 'number') as number[];
    return validValues.reduce((acc, curr) => acc + curr, 0);
  }
}

@NgModule({
  declarations: [TotalPipe],
  exports: [TotalPipe]
})
export class TotalPipeModule { }
