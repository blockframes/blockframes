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

  public canAction: boolean;

  @Input() set invitation(invit: Invitation) {
    this.invit= invit;
    if (!!this.invit) {
      const userId = this.authQuery.userId;
      const isNotFromUser = !(this.invit.fromUser?.uid === userId);
      const isToOrg = this.invit.toOrg?.id === this.authQuery.orgId;
      const isToUser = this.invit.toUser?.uid === userId;
      this.canAction = (isNotFromUser && isToOrg) || isToUser;
    }
  }

  constructor(
    private service: InvitationService,
    private authQuery: AuthQuery
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
