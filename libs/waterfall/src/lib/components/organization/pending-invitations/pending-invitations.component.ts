import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { InvitationService } from '@blockframes/invitation/service';
import { InvitationDetailed, Waterfall } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/service';
import { filters } from '@blockframes/ui/list/table/filters';

@Component({
  selector: 'waterfall-pending-invitations',
  templateUrl: './pending-invitations.component.html',
  styleUrls: ['./pending-invitations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingInvitationsComponent {

  public filters = filters;
  @Input() invitations: InvitationDetailed[] = [];
  @Input() waterfall: Waterfall;

  constructor(
    private invitationService: InvitationService,
    private organizationService: OrganizationService,
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
  }
}

