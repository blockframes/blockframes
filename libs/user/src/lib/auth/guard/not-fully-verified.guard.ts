import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OrganizationService } from '@blockframes/organization/service';
import { AuthService } from '../service';
import { switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { where } from 'firebase/firestore';
import { InvitationService } from '@blockframes/invitation/service';

@Injectable({ providedIn: 'root' })
export class NotFullyVerifiedGuard implements CanActivate {
  constructor(
    private orgService: OrganizationService,
    private invitationService: InvitationService,
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate() {
    return combineLatest([
      this.authService.auth$,
      this.orgService.org$
    ]).pipe(
      switchMap(async ([authState, org]) => {
        if (!authState.emailVerified) return true;

        if (!authState.profile.orgId) {
          const query = [
            where('mode', '==', 'invitation'),
            where('type', '==', 'joinOrganization'),
            where('toUser.uid', '==', authState.profile.uid)
          ];
          const invitations = await this.invitationService.getValue(query);

          if (invitations.find(invitation => invitation.status === 'pending')) return this.router.createUrlTree(['c/organization/join-congratulations']);

          if (invitations.find(invitation => invitation.status === 'accepted')) return this.router.createUrlTree(['c/o']);

          return true;
        }

        if (org.status === 'accepted') return this.router.createUrlTree(['c/o']);
        return this.router.createUrlTree(['c/organization/create-congratulations']);

      })
    )
  }
}
