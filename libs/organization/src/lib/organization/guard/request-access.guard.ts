import { Injectable } from '@angular/core';
import { OrganizationService } from '../+state';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp } from '@blockframes/utils/apps';
import { AuthService } from '@blockframes/auth/+state';

@Injectable({ providedIn: 'root' })
export class RequestAccessGuard implements CanActivate {
  constructor(
    private service: OrganizationService,
    private router: Router,
    private authService: AuthService,
    private routerQuery: RouterQuery
  ) { }

  canActivate() {
    return combineLatest([
      this.authService.profile$,
      this.service.org$
    ]).pipe(
      map(([user, org]) => {
        if (!user) return this.router.createUrlTree(['/']);
        if (!user.orgId) return this.router.createUrlTree(['/auth/identity']);

        if (org.status === 'accepted') {
          const app = getCurrentApp(this.routerQuery);
          if (!org.appAccess[app]) return;
          if (org.appAccess[app].marketplace) return this.router.createUrlTree(['/c/o/marketplace/home']);
          else if (org.appAccess[app].dashboard) return this.router.createUrlTree(['/c/o/dashboard/home']);
          return true;
        }
      })
    );

  }
}
