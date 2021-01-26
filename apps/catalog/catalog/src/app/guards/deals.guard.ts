import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/+state';

@Injectable({ providedIn: 'root' })
export class CatalogDealsGuard implements CanActivate {

    constructor(private orgQuery: OrganizationQuery) { }

    canActivate() {
        return !this.orgQuery.getActive().appAccess.catalog.dashboard
    }
}
