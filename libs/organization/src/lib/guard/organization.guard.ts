import { Injectable } from '@angular/core';
import {
  OrganizationService,
  OrganizationStatus,
  OrganizationState,
  OrganizationQuery
} from '../+state';
import { Router } from '@angular/router';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { map, switchMap } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth';
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
        if (!user.orgId) {
          return of('/c/organization');
        } else {
          return this.service.syncActive({ id: user.orgId }).pipe(
            map(_ => this.query.getActive()),
            map(org => {
              if (!org) {
                return 'c/organization';
              }
              if (org.status === OrganizationStatus.pending) {
                return 'c/organization/congratulations';
              }
            })
          );
        }
      })
    );
  }
}
