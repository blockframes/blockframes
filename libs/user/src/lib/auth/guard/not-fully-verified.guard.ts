import { Injectable } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { CanActivate, Router } from '@angular/router';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';

@Injectable({ providedIn: 'root' })
export class NotFullyVerifiedGuard implements CanActivate  {
  constructor(
    protected service: OrganizationService,
    private authQuery: AuthQuery,
    protected router: Router
  ) {}

  async canActivate() {
    const { emailVerified } = this.authQuery.getValue();
    if (!emailVerified) return true;

    const { orgId, uid } = this.authQuery.user;
    if (!orgId) {
      
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
    const org = await this.service.getValue(orgId);

    if (org.status === 'accepted') {
      return this.router.parseUrl('c/o');
    } else {
      return this.router.parseUrl('c/organization/create-congratulations');
    }
  }
}
