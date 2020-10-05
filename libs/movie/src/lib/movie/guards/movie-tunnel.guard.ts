import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MovieTunnelGuard implements CanActivate {
  constructor(private routerQuery: RouterQuery,
    private router: Router, private orgQuery: OrganizationQuery, private orgService: OrganizationService) { }

  async canActivate() {
    const movieId: string = this.routerQuery.getValue().state.root.params.movieId;
    const org = await this.orgService.getValue(this.orgQuery.getActiveId())
    const redirect = this.router.parseUrl(`c/o/dashboard/title/${movieId}`);
    return org.movieIds.includes(movieId) ? true : redirect;
  }
}
