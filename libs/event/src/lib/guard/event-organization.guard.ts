import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router } from '@angular/router';
import { OrganizationService } from '@blockframes/organization/+state';
import { EventService } from '../+state';
import { Observable } from 'rxjs';

interface FormRoot {
  confirmExit: () => Observable<boolean>;
}
@Injectable({ providedIn: 'root' })
export class EventOrganizationGuard implements CanActivate, CanDeactivate<unknown> {
  constructor(
    private service: EventService,
    private router: Router,
    private orgService: OrganizationService
  ) { }

  async canActivate(next: ActivatedRouteSnapshot) {
    const eventId: string = next.params['eventId'];
    const event = await this.service.getValue(eventId);
    const orgId = this.orgService.org.id;
    const redirect = this.router.parseUrl(`/c/o/dashboard/event`);
    return orgId === event.ownerOrgId || redirect;
  }

   canDeactivate(
    component: FormRoot
  ) {
    const navObject = this.router.getCurrentNavigation()
    //skip the popup opening if the event is deleted
    if (navObject.extras?.state?.eventDeleted) {
      return true;
    }

    return component.confirmExit();
  }

   
}
