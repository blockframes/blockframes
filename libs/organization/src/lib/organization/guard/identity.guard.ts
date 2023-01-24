import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/service';
import { combineLatest, firstValueFrom } from 'rxjs';
import { hasAnonymousIdentity, hasDisplayName } from '@blockframes/model';
import { OrganizationService } from '../service';

@Injectable({ providedIn: 'root' })
export class IdentityGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private router: Router
  ) { }

  canActivate(next: ActivatedRouteSnapshot) {
    return combineLatest([
      this.authService.user$,
      this.authService.anonymousCredentials$,
    ]).pipe(
      switchMap(async ([userAuth, creds]) => {
        if (userAuth && !userAuth.isAnonymous) {
          const profile = await firstValueFrom(this.authService.profile$);
          const validUser = hasDisplayName(profile) && userAuth.emailVerified && profile.orgId;
          if (!validUser) return this.router.createUrlTree(['/auth/identity']);

          const org = await firstValueFrom(this.orgService.currentOrg$);
          if (org.status !== 'accepted') return this.router.createUrlTree(['/c/organization/create-congratulations']);

          return true;
        }
        if (!hasAnonymousIdentity(creds, 'protected')) return this.router.createUrlTree([`/organization/${next.params.orgId}/email`], { queryParams: next.queryParams });
        return true;
      })
    );
  }
}
