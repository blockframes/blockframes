import { Injectable } from '@angular/core';
import { OrganizationService } from '../+state';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { getOrgModuleAccess, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { AuthService } from '@blockframes/auth/+state';

@Injectable({ providedIn: 'root' })
export class PendingOrganizationGuard implements CanActivate {
  constructor(
    private service: OrganizationService,
    private router: Router,
    private authService: AuthService,
    private routerQuery: RouterQuery,
  ) { }

  canActivate() {
    return combineLatest([
      this.authService.user$,
      this.service.org$
    ]).pipe(
      map(([user, org]) => {
        if (!user) return this.router.createUrlTree(['/']);
        if (!user.orgId) return this.router.createUrlTree(['/auth/identity']);
        if (!org) return this.router.createUrlTree(['/auth/identity']);

        if (org.status === 'accepted') {
          const app = getCurrentApp(this.routerQuery);
          const [moduleAccess = 'dashboard'] = getOrgModuleAccess(org, app);
          return this.router.createUrlTree([`/c/o/${moduleAccess}/home`]);
        }

        return true;
      })
    );
  }
}
