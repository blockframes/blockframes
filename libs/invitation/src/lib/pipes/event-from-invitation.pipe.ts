import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { Event, Invitation } from '@blockframes/model';
import { EventService } from '@blockframes/event/service';

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