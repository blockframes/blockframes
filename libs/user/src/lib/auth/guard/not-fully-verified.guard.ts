import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { AuthService } from '../+state';
import { switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotFullyVerifiedGuard implements CanActivate {
  constructor(
    private orgService: OrganizationService,
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

        if (!authState.user.orgId) {
          const invitations = await this.orgService.getValue(ref => ref.where('mode', '==', 'invitation')
            .where('type', '==', 'joinOrganization')
            .where('toUser.uid', '==', authState.user.uid));

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
