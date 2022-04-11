import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { getGuest } from '@blockframes/invitation/pipes/guest.pipe';
import { Invitation, InvitationDetailed } from '@blockframes/model';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: 'invitation-guest-table',
  templateUrl: './guest-table.component.html',
  styleUrls: ['./guest-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuestTableComponent {
  public _invitations: Invitation[] | InvitationDetailed[];

  @Input() set invitations(invitations: InvitationDetailed[]) {
    if (invitations) {
      this._invitations = invitations.map((invitation: InvitationDetailed) => {
        invitation.guest = getGuest(invitation, 'user');
        return invitation;
      });
    }
  }

  @Input() @boolean showInvitationListColumns = false;
}
