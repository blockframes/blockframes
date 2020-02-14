import { Injectable } from '@angular/core';
import { InvitationService } from '../+state/invitation.service';
import { InvitationStatus } from '../+state';
import { AuthQuery } from '@blockframes/auth';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NoOrganizationInvitationGuard {
  constructor(private service: InvitationService, private authQuery: AuthQuery, private router: Router) {
  }

  async canActivate() {
    const uid = this.authQuery.userId;
    const invitations = await this.service.getValue(ref => ref.where('user.uid', '==', uid));
    if (invitations.find(invitation => invitation.status === InvitationStatus.pending)) {
      return this.router.parseUrl('c/organization/join-congratulations');
    } else if (invitations.find(invitation => invitation.status === InvitationStatus.accepted)) {
      return this.router.parseUrl('c/o');
    }
    return true;
  }
}
