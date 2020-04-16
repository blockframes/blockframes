import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Event } from '../+state/event.model';
import { EventService } from '../+state';

@Pipe({ name: 'eventLink', pure: false })
export class EventLinkPipe implements PipeTransform {
  constructor(private service: EventService) {}
  transform(event: Event): string[] {
    if (this.service.isOwner(event)) {
      return event.end.getTime() < Date.now() ? [event.id] : [event.id, 'edit'];
    } else {
      if (event.start.getTime() < Date.now() || event.end.getTime() > Date.now()) {
        return [event.id];
      } else {
        return [event.id, 'session'];
      }
    }
  }
}

@NgModule({
  declarations: [EventLinkPipe],
  exports: [EventLinkPipe],
})
export class EventLinkModule {}