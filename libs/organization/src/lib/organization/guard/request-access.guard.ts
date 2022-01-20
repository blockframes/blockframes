import { Injectable } from '@angular/core';
import { OrganizationService } from '../+state';
import { CanActivate, Router } from '@angular/router';
import { CollectionGuardConfig } from 'akita-ng-fire';
import { map } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { combineLatest } from 'rxjs';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp } from '@blockframes/utils/apps';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class RequestAccessGuard implements CanActivate {
  constructor(
    protected service: OrganizationService,
    protected router: Router,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery
  ) { }

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

        if (org.status === 'accepted') {
          const app = getCurrentApp(this.routerQuery);
          if (!org.appAccess[app]) {
            return;
          }
          if (org.appAccess[app].marketplace) {
            return this.router.createUrlTree(['/c/o/marketplace/home']);
          }
          else if (org.appAccess[app].dashboard) {
            return this.router.createUrlTree(['/c/o/dashboard/home']);
          }

          return true;
        }
      })
    );

  }
}
