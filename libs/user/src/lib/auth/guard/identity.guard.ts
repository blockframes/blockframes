import { Injectable } from '@angular/core';
import { AuthService } from '../+state';
import { switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { hasDisplayName } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { CanActivate, Router } from '@angular/router';
import { where } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class IdentityGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private invitationService: InvitationService,
    private router: Router,
  ) { }

  canActivate() {
    return combineLatest([
      this.authService.auth$,
      this.orgService.org$
    ]).pipe(
      switchMap(async ([authState, org]) => {
        if (!authState || authState.isAnonymous) return true;

        if (!authState.emailVerified) return this.router.createUrlTree(['c/organization/join-congratulations']);

        if (!hasDisplayName(authState.profile)) return true;

        if (authState.profile.orgId) {
          if (!org) return true;

          if (org.status === 'accepted') return this.router.createUrlTree(['c/o']);

          return this.router.createUrlTree(['c/organization/create-congratulations']);
        } else {
          const requestQuery = [
            where('mode', '==', 'request'),
            where('type', '==', 'joinOrganization'),
            where('fromUser.uid', '==', authState.profile.uid)
          ];
          const requests = await this.invitationService.getValue(requestQuery);

          if (requests.find(request => request.status === 'pending')) return this.router.createUrlTree(['c/organization/join-congratulations']);

          if (requests.find(invitation => invitation.status === 'accepted')) return this.router.createUrlTree(['c/o']);

          const invitationsQuery = [
            where('mode', '==', 'invitation'),
            where('type', '==', 'joinOrganization'),
            where('toUser.uid', '==', authState.profile.uid)
          ];
          const invitations = await this.invitationService.getValue(invitationsQuery);

          if (invitations.find(invitation => invitation.status === 'accepted')) return this.router.createUrlTree(['c/o']);

          return true;
        }
      })
    )
  }

}
