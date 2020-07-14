import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Invitation } from '../+state';
import { Observable } from 'rxjs';
import { EventService, Event } from '@blockframes/event/+state';

@Pipe({
  name: 'eventTitle'
})
export class EventTitlePipe implements PipeTransform {
  constructor(private eventService: EventService) { }
  transform(invitation: Invitation): Observable<Event> {
    return this.eventService.syncDoc({ id: invitation.docId })
  }
}

@NgModule({
  exports: [EventTitlePipe],
  declarations: [EventTitlePipe],
})
export class EventTitlePipeModule { }