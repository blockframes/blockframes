import { Pipe, PipeTransform } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';

function min(amount: number) {
  return 1000 * 60 * amount;
}

@Pipe({name: 'eventSize', pure: true})
export class EventSizePipe implements PipeTransform {

  transform(event: CalendarEvent): 'underCreation'|'small'|'large' {
    if (event.meta?.tmp) {
      return 'underCreation';
    }
    if (event.start && event.end) {
      const delta = event.end.getTime() - event.start.getTime();
      return delta <= min(60) ? 'small' : 'large';
    }
  }
}
