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

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class OrganizationGuard extends CollectionGuard<OrganizationState> {
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
        if (!user) {
          return of('/');
        }
        if (!user.orgId) {
          return of('/auth/identity');
        } else {
          return this.service.syncActive({ id: user.orgId }).pipe(
            map(() => this.query.getActive()),
            map(org => {
              if (!org) {
                return '/auth/identity';
              }
              if (org.status !== 'accepted') {
                return '/c/organization/create-congratulations';
              }
            })
          );
        }
      })
    );
  }
}
