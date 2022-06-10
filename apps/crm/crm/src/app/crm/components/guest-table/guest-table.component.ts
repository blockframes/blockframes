import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { getGuest, Invitation, InvitationDetailed } from '@blockframes/model';
import { sorts } from '@blockframes/ui/list/table/sorts';

@Component({
  selector: 'invitation-guest-table',
  templateUrl: './guest-table.component.html',
  styleUrls: ['./guest-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuestTableComponent {
  public _invitations: Invitation[] | InvitationDetailed[];
  public sorts = sorts;

  @Input() set invitations(invitations: InvitationDetailed[]) {
    if (invitations) {
      this._invitations = invitations.map((invitation: InvitationDetailed) => {
        invitation.guest = getGuest(invitation, 'user');
        return invitation;
      });
    }
  }
}
