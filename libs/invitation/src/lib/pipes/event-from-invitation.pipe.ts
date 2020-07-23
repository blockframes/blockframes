import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Invitation } from '../+state';
import { Observable } from 'rxjs';
import { EventService, Event } from '@blockframes/event/+state';

@Pipe({
  name: 'eventFromInvitation'
})
export class EventFromInvitationPipe implements PipeTransform {
  constructor(private eventService: EventService) { }
  transform(invitation: Invitation): Observable<Event> {
    return this.eventService.valueChanges(invitation.docId)
  }
}

@NgModule({
  exports: [EventFromInvitationPipe],
  declarations: [EventFromInvitationPipe],
})
export class EventFromInvitationPipeModule { }