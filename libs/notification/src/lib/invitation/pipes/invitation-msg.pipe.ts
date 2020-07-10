import { NgModule, Pipe, PipeTransform, ChangeDetectionStrategy, Directive } from '@angular/core';
import { Invitation, InvitationService } from '../+state';
import { EventService } from '@blockframes/event/+state';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'invitationMsg'
})
export class InvitationMsgPipe implements PipeTransform {

  constructor(private eventService: EventService, private invitationService: InvitationService) { }

  transform(invitation: Invitation): Observable<string> {
    const isForMe = this.invitationService.isInvitationForMe(invitation);
    let message: string;
    switch (invitation.type) {
      case 'joinOrganization':
        if (invitation.mode === 'request') {
          return new BehaviorSubject(`${invitation.fromUser.firstName} ${invitation.fromUser.lastName} wants to join your organization.`).asObservable();
        } else {
          return new BehaviorSubject(`Your organization sent an invitation to this user email: ${invitation.toUser.email}.`).asObservable();
        }
      case 'attendEvent':
        if (isForMe) {
          if (invitation.mode === 'request') {
            let from: string;
            if (invitation.fromOrg) {
              from = invitation.fromOrg.denomination.public ? invitation.fromOrg.denomination.public : invitation.fromOrg.denomination.full;
            } else if (invitation.fromUser) {
              from = invitation.fromUser.firstName && invitation.fromUser.lastName ? `${invitation.fromUser.firstName} ${invitation.fromUser.lastName}` : invitation.fromUser.email;
            }
            if (invitation.docId) {
              return this.eventService.syncDoc({ id: invitation.docId }).pipe(map(event => 
                `${from} invited you to <a routerLink="/c/o/dashboard/event/${event.id}">${event.title}</a>, ${new Date(event.start).toDateString()}`))
            }
            return new BehaviorSubject(`${from} requested to attend your event.`).asObservable();
          } else {
            return new BehaviorSubject('You have been invited to an event.').asObservable();
          }
        } else {
          return new BehaviorSubject(`Your ${invitation.mode} has been sent.`).asObservable();
        }
    }
  }
}

@NgModule({
  declarations: [InvitationMsgPipe],
  exports: [InvitationMsgPipe]
})
export class InvitationMsgModule { }
