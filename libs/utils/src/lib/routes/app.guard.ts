import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Injectable({ providedIn: 'root' })
export class AppGuard implements CanActivate {
  constructor(
    protected router: Router,
    private query: OrganizationQuery,
    private snackBar: MatSnackBar,
    private routerQuery: RouterQuery) { }

  canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const app = getCurrentApp(this.routerQuery);
    const isMarketplace = state.url.split('/').includes('marketplace');
    const org = this.query.getActive();
    if (isMarketplace) {
      if (org.appAccess[app]?.marketplace) {
        return true;
      } else if (org.appAccess[app]?.dashboard) {
        return this.router.parseUrl('c/o/dashboard');
      } else {
        this.snackBar.open('You don\'t have access to this application.', '', { duration: 5000 });
        return this.router.parseUrl('c/o/request-access');
      }
    } else {
      if (!org.appAccess[app]?.dashboard && !org.appAccess[app]?.marketplace) {
        this.snackBar.open('You don\'t have access to this application.', '', { duration: 5000 });
        return this.router.parseUrl('c/o/request-access');
      }
      return org.appAccess[app].dashboard;
    }
  }
}
