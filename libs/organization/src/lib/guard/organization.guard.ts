import { Injectable } from '@angular/core';
import { OrganizationService, OrganizationStatus, OrganizationState, OrganizationQuery, OrganizationStore } from '../+state';
import { Router } from '@angular/router';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class OrganizationGuard extends CollectionGuard<OrganizationState> {
  constructor(
    protected service: OrganizationService,
    protected router: Router,
    private query: OrganizationQuery,
    private store: OrganizationStore,
  ) {
    super(service)
  }

  sync() {
    return this.service.syncQuery().pipe(
      map(_ =>  this.query.getAll()),
      tap(orgs => this.store.setActive(orgs[0].id)),
      map(orgs => {
        if (!orgs[0]) {
          return false;
        }
        if (orgs[0].status === OrganizationStatus.pending) {
          return 'layout/organization/congratulations';
        }
      })
    );
  }
}
