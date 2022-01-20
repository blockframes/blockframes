import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Invitation, InvitationService } from './+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Router } from '@angular/router';
import { getCurrentApp, getOrgModuleAccess } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { OrganizationService } from '@blockframes/organization/+state';
import { map, startWith, tap } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest } from 'rxjs';

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

  // Invitation count for conditions
  invitationCount$ = this.service.myInvitations$.pipe(map(inv => inv.length));

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
    private routerQuery: RouterQuery,
    private orgService: OrganizationService,
  ) { }

  acceptAll(invitations: Invitation[]) {
    const pendingInvitations = invitations.filter(invitation => invitation.status === 'pending');
    for (const invitation of pendingInvitations) {
      this.service.acceptInvitation(invitation);
    }
  }

  leadToHomepage() {
    const app = getCurrentApp(this.routerQuery);
    const org = this.orgService.org;
    const [moduleAccess = 'dashboard'] = getOrgModuleAccess(org, app);
    return this.router.navigate([`/c/o/${moduleAccess}/home`]);
  }
}
