import { Component, ChangeDetectionStrategy } from '@angular/core';
import { InvitationQuery, InvitationService } from '@blockframes/invitation/+state';

@Component({
  selector: 'festival-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationComponent {

  // Invitation that require an action
  invitations$ = this.query.toMe();

  constructor(private query: InvitationQuery, private invitationService: InvitationService) { }

  acceptAll() {
    const invitations = this.query.getAll().filter(invitation => this.query.isToMe(invitation));
    for (const invitation of invitations) {
      this.invitationService.acceptInvitation(invitation);
    }
  }
}
