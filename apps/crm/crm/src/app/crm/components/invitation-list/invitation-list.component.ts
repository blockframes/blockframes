import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { getGuest } from '@blockframes/invitation/pipes/guest.pipe';
import { Invitation, InvitationDetailed } from '@blockframes/model';

@Component({
  selector: 'invitation-list-table',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationListComponent {
  public _invitations: Invitation[] | InvitationDetailed[];

  @Input() set invitations(invitations: InvitationDetailed[]) {
    if (invitations) {
      this._invitations = invitations.map((invitation: InvitationDetailed) => {
        invitation.guest = getGuest(invitation, 'user');
        return invitation;
      });
    }
  }
}
