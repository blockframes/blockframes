import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { Permissions, PermissionsStore } from '../+state';
import { Router, UrlTree } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth';
import { Subscription } from 'rxjs';

export const permissionsQuery = (orgId: string): Query<Permissions> => ({
  path: `permissions/${orgId}`,
  userAppsPermissions: (org: Permissions) => ({
    path: `permissions/${org.orgId}/userAppsPermissions`
  }),
  userDocsPermissions: (org: Permissions) => ({
    path: `permissions/${org.orgId}/userDocsPermissions`
  }),
  orgDocsPermissions: (org: Permissions) => ({
    path: `permissions/${org.orgId}/orgDocsPermissions`
  })
});

@Injectable({ providedIn: 'root' })
export class PermissionsGuard {
  private subscription: Subscription;

  constructor(
    private fireQuery: FireQuery,
    private auth: AuthQuery,
    private store: PermissionsStore,
    private router: Router
  ) {}

  isUrlTree(result: Permissions | UrlTree) {
    return result instanceof UrlTree;
  }

  canActivate() {
    return new Promise(res => {
      // TODO: handle cases where we create multiple instances of subscription without unsubscribing
      this.subscription = this.auth.user$
        .pipe(
          switchMap(user => {
            if (!user.orgId) throw new Error('User has no orgId');
            return this.fireQuery.fromQuery<Permissions>(permissionsQuery(user.orgId));
          }),
          tap(permissions => this.store.update(permissions))
        )
        .subscribe({
          next: (result: Permissions) => res(!!result),
          error: () => res(this.router.parseUrl('/layout/organization-home'))
        });
    });
  }

  canDeactivate() {
    this.subscription.unsubscribe();
    return true;
  }
}
