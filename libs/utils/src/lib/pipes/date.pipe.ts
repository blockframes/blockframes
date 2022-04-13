import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { toDate } from '../helpers';
import type firestore from 'firebase/firestore';

@Pipe({ name: 'toDate' })
export class ToDatePipe implements PipeTransform {

  transform(date: Date | firestore.Timestamp) {
    return toDate(date);
  }
}

@NgModule({
  declarations: [ToDatePipe],
  exports: [ToDatePipe]
})
export class ToDateModule { }
