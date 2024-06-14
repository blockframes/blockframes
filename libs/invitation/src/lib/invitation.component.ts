import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { InvitationService } from './service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Router } from '@angular/router';
import { OrganizationService } from '@blockframes/organization/service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { combineLatest, map, startWith, tap } from 'rxjs';
import { APP } from '@blockframes/utils/routes/utils';
import { Invitation, App, getOrgModuleAccess } from '@blockframes/model';

const applyFilters = (invitations: Invitation[], filters: { type: string[], status: string[] }) => {
  const inv = filters.type?.length ? invitations.filter(inv => filters.type.includes(inv.type)) : invitations;
  return filters.status?.length ? inv.filter(inv => filters.status.includes(inv.status)) : inv;
};

@Component({
  selector: 'invitation-view',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationComponent {
  form = new UntypedFormGroup({
    type: new UntypedFormControl([]),
    status: new UntypedFormControl([]),
  });

  // Invitation count for conditions
  invitationCount$ = this.service.invitationCount({ onlyPending: false });

  // Invitation that require an action
  invitations$ = combineLatest([
    this.service.myInvitations$,
    this.form.valueChanges.pipe(startWith({ type: [], status: [] }))
  ]).pipe(
    map(([invitations, filters]) => applyFilters(invitations, filters)),
    tap(invitations => {
      invitations.length ?
        this.dynTitle.setPageTitle('Invitations List') :
        this.dynTitle.setPageTitle('Invitations List', 'Empty');
    })
  );

  /** @dev i18n is only on waterfall app for now #9699 */
  public bfi18n = this.app === 'waterfall';

  constructor(
    private service: InvitationService,
    private dynTitle: DynamicTitleService,
    private router: Router,
    private orgService: OrganizationService,
    @Inject(APP) private app: App
  ) { }

  acceptAll(invitations: Invitation[]) {
    const pendingInvitations = invitations.filter(invitation => invitation.status === 'pending');
    for (const invitation of pendingInvitations) {
      this.service.acceptInvitation(invitation);
    }
  }

  leadToHomepage() {
    const org = this.orgService.org;
    const [moduleAccess = 'dashboard'] = getOrgModuleAccess(org, this.app);
    return this.router.navigate([`/c/o/${moduleAccess}/home`]);
  }
}
