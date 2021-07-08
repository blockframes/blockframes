import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { getDeepValue } from './deep-key.pipe';

@Pipe({ name: 'join' })
export class JoinPipe implements PipeTransform {
  transform(data: unknown[], path: string = '', separator: string = ', ') {
    return data.map(s => typeof s === 'string' ? s : getDeepValue(s, path)).join(separator)
  }
}

@NgModule({
  declarations: [JoinPipe],
  exports: [JoinPipe]
})
export class JoinPipeModule { }
