import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Organization, OrganizationQuery } from '../+state';

@Injectable({ providedIn: 'root' })
export class OrgResolver implements Resolve<Organization> {

  constructor(private query: OrganizationQuery) {
  }

  resolve(route: ActivatedRouteSnapshot): Organization {
    const id = route.params['id'];
    return this.query.getEntity(id);
  }
}
