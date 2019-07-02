import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { OrganizationRights, RightsStore } from '../+state';
import { Router, UrlTree } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth';
import { Subscription } from 'rxjs';

export const rightsQuery = (orgId: string): Query<OrganizationRights> => ({
  path: `rights/${orgId}`,
  userAppsRights: (org: OrganizationRights) => ({
    path: `rights/${org.orgId}/userAppsRights`
  }),
  userDocsRights: (org: OrganizationRights) => ({
    path: `rights/${org.orgId}/userDocsRights`
  }),
  orgDocsRights: (org: OrganizationRights) => ({
    path: `rights/${org.orgId}/orgDocsRights`
  })
});

@Injectable({ providedIn: 'root' })
export class RightsGuard {
  private subscription: Subscription;

  constructor(
    private fireQuery: FireQuery,
    private auth: AuthQuery,
    private store: RightsStore,
    private router: Router
  ) {}

  isUrlTree(result: OrganizationRights | UrlTree) {
    return result instanceof UrlTree;
  }

  canActivate() {
    return new Promise(res => {
      // TODO: handle cases where we create multiple instances of subscription without unsubscribing
      this.subscription = this.auth.user$
        .pipe(
          switchMap(user => {
            if (!user.orgId) throw new Error('User has no orgId');
            return this.fireQuery.fromQuery<OrganizationRights>(rightsQuery(user.orgId));
          }),
          tap(rights => this.store.update(rights))
        )
        .subscribe({
          next: (result: OrganizationRights) => {
            res(!!result)
          },
          error: () => res(this.router.parseUrl('/layout/welcome'))
        });
    });
  }

  canDeactivate() {
    this.subscription.unsubscribe();
    return true;
  }
}
