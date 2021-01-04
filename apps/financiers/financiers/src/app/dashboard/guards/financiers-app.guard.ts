import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class FinanciersAppGuard implements CanActivate {
  constructor(protected router: Router, private query: OrganizationQuery, private snackBar: MatSnackBar) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isMarketplace = state.url.split('/').includes('marketplace');
    const org = this.query.getActive();
    if (isMarketplace) {
      if (org.appAccess.financiers.marketplace) {
        return true;
      } else if (org.appAccess.financiers.dashboard) {
        return this.router.parseUrl('c/o/dashboard');
      } else {
        this.snackBar.open('You don\'t have access to this application.', '', { duration: 5000 });
        return false;
      }
    } else {
      if (!org.appAccess.financiers.dashboard && !org.appAccess.financiers.marketplace) {
        this.snackBar.open('You don\'t have access to this application.', '', { duration: 5000 });
        return false;
      }
      return org.appAccess.financiers.dashboard;
    }
  }
}
