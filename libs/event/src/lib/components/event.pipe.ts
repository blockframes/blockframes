import { Pipe, PipeTransform } from '@angular/core';
import { Event } from '@blockframes/model';

function minute(amount: number) {
  return 1000 * 60 * amount;
}

@Pipe({name: 'eventSize', pure: true})
export class EventSizePipe implements PipeTransform {

  transform(event: Event): 'local'|'small'|'large' {
    if (event.type === 'local') {
      return 'local';
    }
    if (event.allDay) {
      return 'small';
    }
    if (event.start && event.end) {
      const delta = event.end.getTime() - event.start.getTime();
      return delta <= minute(90) ? 'small' : 'large';
    }
  }
}
