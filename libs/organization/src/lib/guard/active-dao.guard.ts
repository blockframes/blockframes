import { Injectable } from '@angular/core';
import {
  OrganizationService,
  OrganizationQuery
} from '../organization/+state';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ActiveDaoGuard {
  constructor(
    protected service: OrganizationService,
    private orgQuery: OrganizationQuery,
    protected router: Router
  ) {}

  canActivate() {
    const { id, isBlockchainEnabled } = this.orgQuery.getActive();
    if (isBlockchainEnabled) {
      return true;
    }
    return this.router.parseUrl(`/c/o/organization/${id}/activate`);
  }
}
