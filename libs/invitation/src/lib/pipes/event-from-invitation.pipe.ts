import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Invitation } from '../+state';
import { Observable } from 'rxjs';
import { Event } from '@blockframes/model';
import { EventService } from '@blockframes/event/+state';

@Pipe({
  name: 'eventFromInvitation'
})
export class EventFromInvitationPipe implements PipeTransform {
  constructor(private eventService: EventService) { }
  transform(invitation: Invitation): Observable<Event> {
    return this.eventService.valueChanges(invitation.eventId)
  }
}

@NgModule({
  exports: [EventFromInvitationPipe],
  declarations: [EventFromInvitationPipe],
})
export class EventFromInvitationPipeModule { }