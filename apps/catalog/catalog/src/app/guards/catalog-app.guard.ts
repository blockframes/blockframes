import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class CatalogAppGuard implements CanActivate {
  constructor(
    protected service: OrganizationService,
    protected router: Router,
    private query: OrganizationQuery,
    private snackBar: MatSnackBar
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isMarketplace = state.url.split('/').includes('marketplace');
    const org = this.query.getActive();
    if (isMarketplace) {
      if(!org.appAccess.catalog.marketplace) {
        this.snackBar.open('You don\'t have access to this application.', '', { duration: 5000 });
        return false
      } else this.router.parseUrl('c/o/dashboard');
    } else {
      if(!org.appAccess.catalog.dashboard) {
        this.snackBar.open('You don\'t have access to this application.', '', { duration: 5000 });
        return false
      } else this.router.parseUrl('c/o/marketplace');
    }
  }
}
