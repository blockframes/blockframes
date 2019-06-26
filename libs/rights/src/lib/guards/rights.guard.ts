import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { OrganizationRights, RightsStore } from '../+state';
import { Router, UrlTree } from '@angular/router';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth';
import { Subscription, of } from 'rxjs';
import { applyTransaction } from '@datorama/akita';

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
    console.log("result: ", result)
    console.log("route: ", this.router.url)
    return result instanceof UrlTree;
  }

  canActivate() {
    return new Promise(res => {
      // TODO: handle cases where we create multiple instances of subscription without unsubscribing
      this.subscription = this.auth.user$
        .pipe(
          switchMap(user => {
            if (!user.orgId) throw new Error('User has no orgId');
            return this.fireQuery.fromQuery(rightsQuery(user.orgId));
          }),
          tap(rights => {
            applyTransaction(() => {
              this.store.upsert(rights[this.store.idKey], rights);
              this.store.setActive(rights[this.store.idKey]);
            });
          })
        )
        .subscribe({
          next: (result: OrganizationRights | UrlTree) =>
            this.isUrlTree(result) ? res(result) : res(!!result),
          error: (e) => {
            console.log("error", e)
            res(this.router.parseUrl('/layout/welcome'))
          }
        });
    });
  }

  canDeactivate() {
    this.subscription.unsubscribe();
    return true;
  }
}
