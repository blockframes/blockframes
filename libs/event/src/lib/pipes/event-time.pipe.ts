import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Event } from '../+state/event.model';

@Pipe({name: 'eventTime', pure: true})
export class EventTimePipe implements PipeTransform {

  transform(event: Event): 'early'|'onTime'|'late' {
    const now = new Date().getTime();
    if (now < event.start.getTime()) {
      return 'early';
    }
    if (now > event.end.getTime()) {
      return 'late';
    }
    return 'onTime';
  }
}

@NgModule({
  declarations: [EventTimePipe],
  exports: [EventTimePipe],
})
export class EventTimeModule {}
