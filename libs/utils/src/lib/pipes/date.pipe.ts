import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { toDate } from '../helpers';
import { Timestamp } from '@blockframes/model';

@Pipe({ name: 'toDate' })
export class ToDatePipe implements PipeTransform {

  transform(date: Date | Timestamp) {
    return toDate(date);
  }
}

@NgModule({
  declarations: [ToDatePipe],
  exports: [ToDatePipe]
})
export class ToDateModule { }
