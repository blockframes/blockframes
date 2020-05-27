import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Event } from '@blockframes/event/+state';
import { Invitation, InvitationService } from '../../+state';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';

@Component({
  selector: 'invitation-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionComponent {

  @Input() event: Event;
  public invit: Invitation;

  @Input() set invitation(invit: Invitation) {
    this.invit= invit;
  }

  constructor(
    private service: InvitationService
  ) {}

  accept(invitation: Invitation) {
    this.service.acceptInvitation(invitation);
  }

  decline(invitation: Invitation) {
    this.service.declineInvitation(invitation);
  }

  /** Request the owner to accept invitation (automatically accepted if event is public) */
  request(event: Event) {
    const { ownerId, id } = event;
    this.service.request('org', ownerId).from('user').to('attendEvent', id);
  }
}
