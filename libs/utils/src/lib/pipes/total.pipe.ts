import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { getDeepValue } from './deep-key.pipe';

@Pipe({ name: 'total_pipe' })
export class TotalPipe implements PipeTransform {
  transform(data: unknown[], path: string,): number {
    let something = 0;
    if (typeof data[0] === 'number') {
      data.forEach(s => something += s as number)
      return something;
    }
    data.forEach(s => something += +getDeepValue(s, path))
    return something;
  }
}

@NgModule({
  declarations: [TotalPipe],
  exports: [TotalPipe]
})
export class TotalPipeModule { }
