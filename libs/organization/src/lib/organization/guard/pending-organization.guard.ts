import { Injectable } from '@angular/core';
import { OrganizationService } from '../+state';
import { CanActivate, Router } from '@angular/router';
import { CollectionGuardConfig } from 'akita-ng-fire';
import { map } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { combineLatest } from 'rxjs';
import { getOrgModuleAccess, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class PendingOrganizationGuard implements CanActivate {
  constructor(
    protected service: OrganizationService,
    protected router: Router,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery,
  ) {}

  canActivate() {
    return combineLatest([
      this.authQuery.user$,
      this.service.org$
    ]).pipe(
      map(([user, org]) => {
        if (!user) {
          return this.router.createUrlTree(['/']);
        }

        if (!user.orgId) {
          return this.router.createUrlTree(['/auth/identity']);
        }

        if (!org) {
          return this.router.createUrlTree(['/auth/identity']);
        }

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
