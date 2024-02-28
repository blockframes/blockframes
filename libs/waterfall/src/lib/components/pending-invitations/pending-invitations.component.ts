import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService } from '@blockframes/invitation/service';
import { Invitation, InvitationDetailed } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/service';
import { WaterfallService } from '../../waterfall.service';
import { filters } from '@blockframes/ui/list/table/filters';

@Component({
  selector: 'waterfall-pending-invitations',
  templateUrl: './pending-invitations.component.html',
  styleUrls: ['./pending-invitations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingInvitationsComponent {

  public filters = filters;
  @Input() invitations: Invitation[] = [];

  constructor(
    private invitationService: InvitationService,
    private organizationService: OrganizationService,
    private waterfallService: WaterfallService,
    private snackBar: MatSnackBar,
  ) {

  }

  async resendInvitation(invitation: InvitationDetailed) {
    const fromOrg = this.organizationService.org;
    await this.invitationService.remove(invitation.id);
    await this.invitationService.invite([invitation.toUser.email], fromOrg)
      .to('joinWaterfall', invitation.waterfallId, invitation.data);
    this.snackBar.open('Invitation sent again', 'close', { duration: 5000 });
  }

  async removeRightHolder(invitation: InvitationDetailed) {
    await this.invitationService.remove(invitation.id);
    if (invitation.status === 'accepted' && invitation.guestOrg?.id) { // TODO #9585 remove from here
      await this.waterfallService.removeOrg(invitation.waterfallId, invitation.guestOrg.id);
    }
  }
}

