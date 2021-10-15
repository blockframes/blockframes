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
import { getOrgModuleAccess, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class PendingOrganizationGuard extends CollectionGuard<OrganizationState> {
  constructor(
    protected service: OrganizationService,
    protected router: Router,
    private query: OrganizationQuery,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery,
  ) {
    super(service);
  }

  sync() {
    return this.authQuery.user$.pipe(
      switchMap(user => {
        if (!user) return of('/');

        if (!user.orgId) {
          return of('/auth/identity');
        } else {
          return this.service.syncActive({ id: user.orgId }).pipe(
            map(() => this.query.getActive()),
            map(org => {
              if (!org) {
                return '/auth/identity';
              }

              if (org.status === 'accepted') {
                const app = getCurrentApp(this.routerQuery);
                const [moduleAccess = 'dashboard'] = getOrgModuleAccess(org, app);
                return `/c/o/${moduleAccess}/home`;
              }
            })
          );
        }
      })
    );
  }
}
