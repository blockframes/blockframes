import { Injectable } from '@angular/core';
import { OrganizationService } from '../organization/+state';
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
    const { orgId } = this.authQuery.user;
    if (!orgId) {
      return true;
    }
    const org = await this.service.getValue(orgId);

    if (org.status === 'pending') {
      return org.appAccess ? this.router.parseUrl('c/organization/create-congratulations') : this.router.parseUrl('c/organization/app-access');
    } else {
      return this.router.parseUrl('c/o');
    }
  }
}
