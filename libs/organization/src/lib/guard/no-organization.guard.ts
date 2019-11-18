import { Injectable } from '@angular/core';
import {
  OrganizationService,
  OrganizationStatus,
  OrganizationQuery,
  OrganizationState
} from '../+state';
import { AuthQuery } from '@blockframes/auth';
import { switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class NoOrganizationGuard extends CollectionGuard<OrganizationState> {
  constructor(
    protected orgService: OrganizationService,
    private authQuery: AuthQuery,
    private query: OrganizationQuery
  ) {
    super(orgService);
  }

  sync() {
    return this.authQuery.user$.pipe(
      switchMap(user => {
        // When the user has no organization, he can navigate.
        if (!user.orgId) {
          return of(true);
        }
        // When the user has an pending organization, he is stuck on congratulations page.
        else {
          return this.orgService.syncActive({ id: user.orgId }).pipe(
            map(_ => this.query.getActive()),
            map(org => {
              if (org.status === OrganizationStatus.pending) {
                return 'layout/organization/congratulations';
              }
            })
          );
        }
      })
    );
  }
}
