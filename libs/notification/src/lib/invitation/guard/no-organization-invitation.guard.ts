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
    const uid = this.authQuery.getValue().user.uid;
    const invitations = await this.service.getValue(ref => ref.where('user.uid', '==', uid));
    if (invitations.find(invitation => invitation.status === InvitationStatus.pending || invitation.status === InvitationStatus.accepted)) {
      return this.router.parseUrl('layout/organization/home');
    }
    return true;
  }
}
