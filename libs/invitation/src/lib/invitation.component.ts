import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { InvitationService } from './+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Router } from '@angular/router';
import { App, getOrgModuleAccess } from '@blockframes/utils/apps';
import { OrganizationService } from '@blockframes/organization/+state';
import { map, startWith, tap } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { APP } from '@blockframes/utils/routes/utils';
import { Invitation } from '@blockframes/model';
import { subMonths } from 'date-fns';
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
  form = new FormGroup({
    type: new FormControl([]),
    status: new FormControl([]),
  });

  private fourMonthsAgo = subMonths(new Date(), 4);

  // Invitation count for conditions
  invitationCount$ = this.service.myInvitations$.pipe(
    map(invitations => {
      /**
      * Filtering out invitations older than 4 months because there is no timeFrame supporting them in invitation-list component.
      */ 
      return invitations.filter(invitation => invitation.date > this.fourMonthsAgo);
    }),
    map(inv => inv.length)
  );

  // Invitation that require an action
  invitations$ = combineLatest([
    this.service.myInvitations$,
    this.form.valueChanges.pipe(startWith({ type: [], status: []  }))
  ])
  .pipe(
    map(([invitations, filters]) => applyFilters(invitations, filters)),
    tap(invitations => {
      invitations.length ?
        this.dynTitle.setPageTitle('Invitations List') :
        this.dynTitle.setPageTitle('Invitations List', 'Empty');
    })
  )
  
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
