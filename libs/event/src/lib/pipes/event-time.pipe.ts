import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Event } from '@blockframes/shared/model';

export type EventTime = 'early' | 'onTime' | 'late';

export function eventTime(event: Event): EventTime {
  const now = new Date().getTime();
  if (now < event.start.getTime()) {
    return 'early';
  }
  if (now > event.end.getTime()) {
    return 'late';
  }
  return 'onTime';
}


@Pipe({name: 'eventTime', pure: true})
export class EventTimePipe implements PipeTransform {

  transform(event: Event): EventTime {
    return eventTime(event);
  }
}

@NgModule({
  declarations: [EventTimePipe],
  exports: [EventTimePipe],
})
export class EventTimeModule {}
