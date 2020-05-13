import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';

@Injectable({ providedIn: 'root' })
export class FestivalAppGuard implements CanActivate {
  constructor(protected router: Router, private query: OrganizationQuery) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isMarketplace = state.url.split('/').includes('marketplace');
    const org = this.query.getActive();
    if (isMarketplace) {
      if (org.appAccess.festival.marketplace) {
        return true;
      } else if (org.appAccess.festival.dashboard) {
        return this.router.parseUrl('c/o/dashboard');
      } else {
        return false;
      }
    } else {
      return org.appAccess.festival.dashboard;
    }
  }
}
