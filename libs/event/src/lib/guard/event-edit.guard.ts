import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { MovieService } from '@blockframes/movie/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';

@Injectable({ providedIn: 'root' })
export class EventEditGuard implements CanActivate {

  constructor(
    private movie: MovieService,
    private orgQuery: OrganizationQuery,
    private router: Router,
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    const eventId: string = next.params['eventId'];
    if (eventId !== 'new') return true;
    
    const redirect = this.router.parseUrl(`/c/o/dashboard/event`);
    const orgId = this.orgQuery.getActiveId();
    const titleId: string = next.queryParams['titleId'];
    if (!titleId) return redirect;
    const title = await this.movie.getValue(titleId);
    return title?.orgIds.includes(orgId) || redirect;
  }
}
