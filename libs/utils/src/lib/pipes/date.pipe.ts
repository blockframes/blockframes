import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { toDate } from '../helpers';
import type firebase from 'firebase';

@Pipe({ name: 'toDate' })
export class ToDatePipe implements PipeTransform {

  transform(date: Date | firebase.firestore.Timestamp) {
    return toDate(date);
  }
}

@NgModule({
  declarations: [ToDatePipe],
  exports: [ToDatePipe]
})
export class ToDateModule { }
