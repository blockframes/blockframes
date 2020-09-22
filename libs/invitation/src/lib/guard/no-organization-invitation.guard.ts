import { Injectable } from '@angular/core';
import { InvitationService } from '../+state/invitation.service';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NoOrganizationInvitationGuard {
  constructor(private service: InvitationService, private authQuery: AuthQuery, private router: Router) {
  }

  async canActivate() {
    const uid = this.authQuery.userId;
    const invitations = await this.service.getValue(ref => ref.where('mode', '==', 'invitation')
      .where('type', '==', 'joinOrganization')
      .where('toUser.uid', '==', uid));
    if (invitations.find(invitation => invitation.status === 'pending')) {
      return this.router.parseUrl('c/organization/join-congratulations');
    } else if (invitations.find(invitation => invitation.status === 'accepted')) {
      return this.router.parseUrl('c/o');
    }
    return true;
  }
}
