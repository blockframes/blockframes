import { Component, ChangeDetectionStrategy } from '@angular/core';
import { InvitationService } from '@blockframes/invitation/service';
import { InvitationDetailed, Waterfall, getGuest } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { where } from 'firebase/firestore';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'waterfall-right-holders',
  templateUrl: './right-holders.component.html',
  styleUrls: ['./right-holders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightHoldersComponent {

  public invitations$ = this.shell.waterfall$.pipe(
    switchMap((waterfall: Waterfall) => {
      const query = [
        where('type', '==', 'joinWaterfall'),
        where('waterfallId', '==', waterfall.id),
        where('fromOrg.id', '==', this.organizationService.org.id),
      ];
      return this.invitationService.valueChanges(query);
    }),
    switchMap(async (invitations: InvitationDetailed[]) => {
      const guestOrgs = invitations.map(i => getGuest(i, 'user').orgId).filter((id) => id);
      const orgIds = Array.from(new Set(guestOrgs));
      const orgsPromises = orgIds.map((id) => this.organizationService.getValue(id));
      const orgs = await Promise.all(orgsPromises);
      for (const invitation of invitations) {
        invitation.guestOrg = orgs.find((org) => org.id === getGuest(invitation, 'user').orgId);
      }
      return invitations;
    }),
  );

  public pendingInvitations$ = this.invitations$.pipe(
    map(invitations => invitations.filter(i => i.status === 'pending'))
  );

  constructor(
    public shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private organizationService: OrganizationService,
    private invitationService: InvitationService,
  ) {
    this.dynTitle.setPageTitle($localize`Right Holders`);
  }

}

