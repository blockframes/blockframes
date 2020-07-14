import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invitation } from '@blockframes/invitation/+state';
import { EventService, Event } from '@blockframes/event/+state';
import { Observable } from 'rxjs';

@Component({
  selector: '[invitation] invitation-message',
  templateUrl: 'message.component.html',
  styleUrls: ['message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageComponent {

  public orgName: string;

  public isEvent = false;

  private _invitation: Observable<Event> | string;

  @Input()
  get invitation() { return (this._invitation as any) }
  set invitation(invitation: Invitation) {
    switch (invitation.type) {
      case 'joinOrganization':
        this.isEvent = false;
        if (invitation.mode === 'request') {
          this._invitation = `${invitation.fromUser.firstName} ${invitation.fromUser.lastName} wants to join your organization.`;
        } else {
          this._invitation = `Your organization sent an invitation to this user email: ${invitation.toUser.email}.`;
        }
        break;
      case 'attendEvent':
        this.isEvent = true;
        if (invitation.mode === 'request') {
          let from: string;
          if (invitation.fromOrg) {
            from = invitation.fromOrg.denomination.public ? invitation.fromOrg.denomination.public : invitation.fromOrg.denomination.full;
          } else if (invitation.fromUser) {
            from = invitation.fromUser.firstName && invitation.fromUser.lastName ? `${invitation.fromUser.firstName} ${invitation.fromUser.lastName}` : invitation.fromUser.email;
          }
          this.orgName = from;
          this._invitation = this.eventService.syncDoc({ id: invitation.docId });
        } else {
          /* Fallback */
          this.isEvent = false;
          this._invitation = 'You have been invited to an event.';
        }
        break;
    }
  }

  constructor(private eventService: EventService) { }
}