import { Injectable } from '@angular/core';
import {
  OrganizationService,
  OrganizationStatus
} from '../+state';
import { AuthQuery } from '@blockframes/auth';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NoOrganizationGuard {
  constructor(
    protected service: OrganizationService,
    private authQuery: AuthQuery,
    protected router: Router
  ) {}

  async canActivate() {
    const user = this.authQuery.user;
    if (!user.orgId) {
      return true;
    }
    const org = await this.service.getValue(user.orgId);
    return org.status === OrganizationStatus.pending
      ? this.router.parseUrl('layout/organization/congratulations')
      : this.router.parseUrl('layout/o');
  }
}
