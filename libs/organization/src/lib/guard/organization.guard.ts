import { Injectable } from '@angular/core';
import {
  OrganizationService,
  OrganizationStatus,
  OrganizationState,
  OrganizationQuery,
  OrganizationStore
} from '../+state';
import { Router } from '@angular/router';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { map, tap, switchMap } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class OrganizationGuard extends CollectionGuard<OrganizationState> {
  constructor(
    protected service: OrganizationService,
    protected router: Router,
    private query: OrganizationQuery,
    private store: OrganizationStore,
    private authQuery: AuthQuery
  ) {
    super(service);
  }

  sync() {
    return this.service.syncOrgActive().pipe(
      map(_ => this.query.getActive()),
      map(org => {
        if (!org) {
          return false;
        }
        if (org.status === OrganizationStatus.pending) {
          return 'layout/organization/congratulations';
        }
      })
    );
  }
}
