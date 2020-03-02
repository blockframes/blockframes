import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { InvitationService, Invitation } from '../+state';
import { DateGroup } from '@blockframes/utils/helpers';
import { InvitationType, InvitationStatus } from '@blockframes/invitation/types';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'invitation-list',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationListComponent {
  @Input() invitationsByDate: DateGroup<Invitation[]>;

  constructor(
    private service: InvitationService,
    private snackbar: MatSnackBar
  ) {}
  public acceptInvitation(invitation: Invitation) {
    try {
      this.service.acceptInvitation(invitation);
      this.snackbar.open('You accepted the invitation!', 'close', { duration: 5000 });
    } catch (error) {
      this.snackbar.open(error.message, 'close', { duration: 5000 });
    }
  }

  public declineInvitation(invitation: Invitation) {
    try {
      this.service.declineInvitation(invitation);
      this.snackbar.open('You declined the invitation.', 'close', { duration: 5000 });
    } catch (error) {
      this.snackbar.open(error.message, 'close', { duration: 5000 });
    }
  }

  public displayInvitationButtons(invitation: Invitation): boolean {
    return (
      invitation.type === InvitationType.fromUserToOrganization &&
      invitation.status === InvitationStatus.pending
    );
  }

}
