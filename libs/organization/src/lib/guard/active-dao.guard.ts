import { Injectable } from '@angular/core';
import {
  OrganizationService,
  OrganizationQuery
} from '../+state';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ActiveDaoGuard {
  constructor(
    protected service: OrganizationService,
    private orgQuery: OrganizationQuery,
    protected router: Router
  ) {}

  async canActivate() {
    const { isBlockchainEnabled } = this.orgQuery.getActive();
    if (isBlockchainEnabled) {
      return true;
    }
    return this.router.parseUrl(`/`);
  }
}
