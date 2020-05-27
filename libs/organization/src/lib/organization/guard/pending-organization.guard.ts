import { Injectable } from '@angular/core';
import {
  OrganizationService,
  OrganizationState,
  OrganizationQuery
} from '../+state';
import { Router } from '@angular/router';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { map, switchMap } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { of } from 'rxjs';
import { getOrgModuleAccess } from '@blockframes/utils/apps';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class PendingOrganizationGuard extends CollectionGuard<OrganizationState> {
  constructor(
    protected service: OrganizationService,
    protected router: Router,
    private query: OrganizationQuery,
    private authQuery: AuthQuery
  ) {
    super(service);
  }

  sync() {
    return this.authQuery.user$.pipe(
      switchMap(user => {
        if (!user.orgId) {
          return of('/c/organization');
        } else {
          return this.service.syncActive({ id: user.orgId }).pipe(
            map(_ => this.query.getActive()),
            map(org => {
              if (!org) {
                return '/c/organization';
              }

              if (org.status === 'accepted') {
                const moduleAccess = getOrgModuleAccess(org);
                return `/c/o/${ moduleAccess[0] || 'dashboard' }/home`;
              }
            })
          );
        }
      })
    );
  }
}
