import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Invitation, InvitationService, InvitationType } from '../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'invitation-item',
  templateUrl: './invitation-item.component.html',
  styleUrls: ['./invitation-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationItemComponent {
  @Input() invitation: Invitation;

  constructor(private service: InvitationService, private snackBar: MatSnackBar) {}

  public get message(): string {
    if (this.invitation.type === InvitationType.fromUserToOrganization) {
      return 'A user wants to join your organization.';
    }
    return ''; // TODO: issue#576, implement one message by type of invitation
  }

  acceptInvitation(invitation: Invitation) {
    this.service.acceptInvitation(invitation.id);
    this.snackBar.open(
      `You accepted to join the delivery's teamwork. You will receive another notification when you'll be able to navigate to the document`,
      'close',
      { duration: 5000 }
    );
  }
}
