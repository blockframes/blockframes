import { Injectable } from '@angular/core';
import { PermissionsState, PermissionsService, PermissionsQuery } from '../+state';
import { Router } from '@angular/router';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { map, switchMap } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: false })
export class PermissionsGuard extends CollectionGuard<PermissionsState> {
  constructor(
    protected service: PermissionsService,
    protected router: Router,
    private authQuery: AuthQuery,
    private query: PermissionsQuery
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
          return of('c/organization');
        } else {
          return this.service.syncActive({ id: user.orgId }).pipe(
            map(() => this.query.getActive()),
            map(permissions => {
              if (!permissions) {
                return 'c/organization';
              }
            })
          );
        }
      })
    );
  }
}
