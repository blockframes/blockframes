import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { getDeepValue } from './deep-key.pipe';

@Pipe({ name: 'total' })
export class TotalPipe implements PipeTransform {
  transform(data: unknown[], path: string,): number {
    // const validValues = data.map(element => getDeepValue(element, path))
    // .filter(value => typeof value === 'number') as number[];
    // return validValues.reduce((acc, curr) => acc + curr, 0);
    let sum = 0;
    if (typeof data[0] === 'number') {
      data.forEach(s => sum += s as number)
      return sum;
    }
    data.forEach(s => sum += +getDeepValue(s, path))
    return sum;
  }
}

@NgModule({
  declarations: [TotalPipe],
  exports: [TotalPipe]
})
export class TotalPipeModule { }
