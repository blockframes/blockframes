import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Invitation, InvitationService, InvitationType } from '../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { FireQuery } from '@blockframes/utils';
import { DeliveryDB } from '@blockframes/material';
import { switchMap, map } from 'rxjs/operators';
import { Movie } from '@blockframes/movie';

@Component({
  selector: 'invitation-item',
  templateUrl: './invitation-item.component.html',
  styleUrls: ['./invitation-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationItemComponent {
  @Input() invitation: Invitation;

  constructor(private service: InvitationService, private snackBar: MatSnackBar) {}

  /** Creates a message based on the invitation.type. */
  public get message(): string {
    if (this.invitation.type === InvitationType.toWorkOnDocument) {
      return `You have been invited to work on a delivery.`;
    }
    if (this.invitation.type === InvitationType.fromUserToOrganization) {
      return `${this.invitation.user.name} ${this.invitation.user.surname} wishes to join your organization`;
    }
  }

  public async acceptInvitation(invitation: Invitation) {
    await this.service.acceptInvitation(invitation.id);
    this.snackBar.open(`You accepted the invitation!`, 'close', { duration: 5000 });
  }

  public async declineInvitation(invitation: Invitation) {
    await this.service.declineInvitation(invitation.id);
    this.snackBar.open(`You declined the invitation.`, 'close', { duration: 5000 });
  }
}
