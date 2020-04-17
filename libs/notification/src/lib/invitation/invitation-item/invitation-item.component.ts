import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { InvitationService, Invitation } from '../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthQuery } from '@blockframes/auth/+state';

@Component({
  selector: 'invitation-item',
  templateUrl: './invitation-item.component.html',
  styleUrls: ['./invitation-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationItemComponent {
  @Input() invitation: Invitation;
  @Input() inWidget: boolean;

  constructor(
    private service: InvitationService,
    private snackBar: MatSnackBar,
    private authQuery: AuthQuery,
  ) { }

  /** Creates a message based on the invitation.type. */
  public get message(): string {
    switch (this.invitation.type) {
      case 'fromUserToOrganization':
        // TODO #1140 Put message in an other file dedicated to that
        return `${this.invitation.fromUser.firstName} ${this.invitation.fromUser.lastName} wants to join your organization`;
      case 'fromOrganizationToUser':
        return `Your organization sent an invitation to this user email: ${this.invitation.toUser.email}`;
      case 'event':
        return this.service.isInvitationForMe(this.invitation) ? `You have been invited to an event !` : `Your invitation have been sent!`;
    }
  }

  public get invitationLink(): string | boolean {
    switch (this.invitation.type) {
      case 'event':
        return `/c/o/marketplace/event/${this.invitation.docId}`;
      default:
        return false;
    }
  }

  public acceptInvitation(invitation: Invitation) {
    try {
      this.service.acceptInvitation(invitation);
      this.snackBar.open('You accepted the invitation!', 'close', { duration: 5000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }

  public declineInvitation(invitation: Invitation) {
    try {
      this.service.declineInvitation(invitation);
      this.snackBar.open('You declined the invitation.', 'close', { duration: 5000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }

  public get displayInvitationButtons(): boolean {
    return this.service.isInvitationForMe(this.invitation) && this.invitation.status === 'pending';
  }

}
