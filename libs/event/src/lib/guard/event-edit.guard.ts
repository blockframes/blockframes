import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import { addHours } from 'date-fns'
import { EventService } from '../service';
import { createEvent, createScreening } from '@blockframes/model';

@Injectable({ providedIn: 'root' })
export class EventEditGuard implements CanActivate {

  constructor(
    private movie: MovieService,
    private event: EventService,
    private orgService: OrganizationService,
    private router: Router,
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    const eventId: string = next.params['eventId'];
    if (eventId !== 'new') return true;

    const redirect = this.router.parseUrl(`/c/o/dashboard/event`);
    const orgId = this.orgService.org.id;
    const titleId = next.queryParamMap.get('titleId');
    if (!titleId) return redirect;
    const title = await this.movie.load(titleId);
    if (!title?.orgIds.includes(orgId)) return redirect;

    const start = new Date();
    const end = addHours(start, 3);
    const event = createEvent({
      type: 'screening',
      start,
      end,
      ownerOrgId: this.orgService.org.id,
      meta: createScreening({ titleId }),
      isSecret: true
    });
    const id = await this.event.add(event);
    return this.router.parseUrl(`/c/o/dashboard/event/${id}/edit/screening`);
  }
}
