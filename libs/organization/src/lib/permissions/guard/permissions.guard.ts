import { Injectable } from '@angular/core';
import { PermissionsState, PermissionsService, PermissionsQuery } from '../+state';
import { Router } from '@angular/router';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class PermissionsGuard extends CollectionGuard<PermissionsState> {
  constructor(
    protected service: PermissionsService,
    protected router: Router,
    private query: PermissionsQuery,
  ) {
    super(service);
  }

  sync() {
    return this.service.syncActivePermissions().pipe(
      map(_ => this.query.getActive()),
      map(permissions => {
        if (!permissions) {
          return 'layout/organization';
        }
      })
    );
  }
}
