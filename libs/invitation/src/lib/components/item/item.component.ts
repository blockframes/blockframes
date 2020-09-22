import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invitation, InvitationService } from '../../+state';

@Component({
  selector: 'invitation-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent {

  @Input() invitation: Invitation;

  constructor(private invitationService: InvitationService) { }

  get eventLink() {
    if (this.invitation.type === 'attendEvent') {
      if (this.invitation.mode === 'request') {
        return `../event/${this.invitation.docId}/edit`;
      } else {
        return `/c/o/marketplace/event/${this.invitation.docId}`;
      }
    } else if (this.invitation.type === 'joinOrganization') {
      const orgId = this.invitation.fromOrg ? this.invitation.fromOrg.id : this.invitation.toOrg.id;
      return `/c/o/organization/${orgId}/view/members`;  
    }
  }

  handleInvitation(invitation: Invitation, action: 'acceptInvitation' | 'declineInvitation') {
    this.invitationService[action](invitation);
  }
}
