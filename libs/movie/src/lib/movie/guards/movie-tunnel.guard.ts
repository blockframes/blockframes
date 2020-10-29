import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { OrganizationService, OrganizationQuery } from '@blockframes/organization/+state';

@Injectable({ providedIn: 'root' })
export class MovieTunnelGuard implements CanActivate {
  constructor(
    private router: Router,
    private orgService: OrganizationService,
    private orgQuery: OrganizationQuery
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    const movieId: string = next.params['movieId'];
    let org = this.orgQuery.getActive();
    if (org.movieIds.includes(movieId)) {
      return true;
    }
    // When creating a move we need to make sure the org is updated before checking
    org = await this.orgService.getValue(org.id);
    const redirect = this.router.parseUrl(`/c/o/dashboard/title`);
    return org.movieIds.includes(movieId) || redirect;
  }
}
