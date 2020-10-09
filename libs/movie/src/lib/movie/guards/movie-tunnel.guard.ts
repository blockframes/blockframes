import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MovieTunnelGuard implements CanActivate {
  constructor(
    private router: Router,
    private orgQuery: OrganizationQuery,
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    const paramId = next.data.paramId || 'movieId'; // We use this guard for campaign and id is "campaignId"
    const movieId: string = next.params[paramId];
    const org = this.orgQuery.getActive();
    const redirect = this.router.parseUrl(`c/o/dashboard/title/${movieId}`);
    return org.movieIds.includes(movieId) || redirect;
  }
}
