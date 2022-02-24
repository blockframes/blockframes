import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getCurrentApp } from '@blockframes/utils/apps';
import { OrganizationService } from '@blockframes/organization/+state';

@Injectable({ providedIn: 'root' })
export class AppGuard implements CanActivate {
  constructor(
    private router: Router,
    private orgService: OrganizationService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const app = getCurrentApp(this.route);
    const isMarketplace = state.url.split('/').includes('marketplace');
    const org = this.orgService.org;
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
      if (!org.appAccess[app]?.dashboard && org.appAccess[app]?.marketplace) {
        return this.router.parseUrl('c/o/marketplace');
      } else if (!org.appAccess[app]?.dashboard && !org.appAccess[app]?.marketplace) {
        this.snackBar.open('You don\'t have access to this application.', '', { duration: 5000 });
        return this.router.parseUrl('c/o/request-access');
      }
      return org.appAccess[app].dashboard;
    }
  }
}
