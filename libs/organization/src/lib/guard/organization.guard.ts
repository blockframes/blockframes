import { Injectable } from '@angular/core';
import {
  OrganizationService,
  OrganizationStatus,
  OrganizationState,
  OrganizationQuery
} from '../+state';
import { Router } from '@angular/router';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class OrganizationGuard extends CollectionGuard<OrganizationState> {
  constructor(
    protected service: OrganizationService,
    protected router: Router,
    private query: OrganizationQuery
  ) {
    super(service);
  }

  sync() {
    return this.service.syncOrgActive().pipe(
      map(_ => this.query.getActive()),
      map(org => {
        if (!org) {
          return 'layout/organization';
        }
        if (org.status === OrganizationStatus.pending) {
          return 'layout/organization/congratulations';
        }
      })
    );
  }
}
