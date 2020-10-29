import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthQuery } from '@blockframes/auth/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { EventService } from '../+state';

@Injectable({ providedIn: 'root' })
export class EventOrganizationGuard implements CanActivate {
  constructor(
    private service: EventService,
    private router: Router,
    private authQuery: AuthQuery,
    private orgQuery: OrganizationQuery
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    const eventId: string = next.params['eventId'];
    const event = await this.service.getValue(eventId);
    const orgId = this.orgQuery.getActiveId();
    const uid = this.authQuery.userId;
    const redirect = this.router.parseUrl(`/c/o/dashboard/event`);
    return orgId === event.ownerId || uid === event.ownerId || redirect;
  }
}
