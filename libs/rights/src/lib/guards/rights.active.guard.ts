import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { OrganizationRights, RightsStore } from '../+state';
import { Router, UrlTree } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth';
import { Subscription, of } from 'rxjs';
import { applyTransaction } from '@datorama/akita';

export const rightsActiveQuery = (orgId: string): Query<OrganizationRights> => ({
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
export class RightsActiveGuard {
  private urlFallback = '/layout';
  private subscription: Subscription;

  constructor(
    private fireQuery: FireQuery,
    private auth: AuthQuery,
    private store: RightsStore,
    private router: Router
  ) {}

  query() {
    return this.auth.user$.pipe(
      switchMap(user => {
        // If the user is new to blockframes and doesn't have an orgId,
        // he's still able to sign up or sign in.
        if (!user.orgId) {
          return of(null);
        }
        return this.fireQuery.fromQuery<OrganizationRights>(rightsActiveQuery(user.orgId));
      })
    );
  }

  canActivate(): Promise<boolean | UrlTree> | UrlTree {
    return new Promise(res => {
      this.subscription = this.query()
        .pipe(
          tap(entity => {
            // If the entity is null, don't we don't set the store and
            // use our fallback path to connect the user.
            if (!entity) {
              return this.router.parseUrl(this.urlFallback);
            }
            applyTransaction(() => {
              try {
                this.store.upsert(entity[this.store.idKey], entity);
                this.store.setActive(entity[this.store.idKey]);
              } catch (err) {
                throw Error(err);
              }
            });
          })
        )
        .subscribe({
          next: result => res(true),
          error: err => res(this.router.parseUrl(this.urlFallback))
        });
    });
  }

  canDeactivate() {
    this.subscription.unsubscribe();
    return true;
  }
}
