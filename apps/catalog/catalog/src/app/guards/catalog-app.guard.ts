import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';

@Injectable({ providedIn: 'root' })
export class CatalogAppGuard implements CanActivate {
  constructor(
    protected service: OrganizationService,
    protected router: Router,
    private query: OrganizationQuery
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isMarketplace = state.url.split('/').includes('marketplace');
    const org = this.query.getActive();
    if (isMarketplace) {
      return org.appAccess.catalogMarketplace ? true : this.router.parseUrl('c/o/dashboard');
    } else {
      return org.appAccess.catalogDashboard ? true : this.router.parseUrl('c/o/marketplace');
    }
  }
}
