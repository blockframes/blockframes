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
      // @TODO(#2710) This async is needed to prevent permission denied
      // in the case where user.orgId exists but not the permissions document.
      // This seems to be caused by the creation/update order when we do
      // orgService.add()
      switchMap(async user => {
        if (!user) {
          return of('/');
        }
        if (!user.orgId) {
          return of('c/organization');
        } else {
          return this.service.syncActive({ id: user.orgId }).pipe(
            map(_ => this.query.getActive()),
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
