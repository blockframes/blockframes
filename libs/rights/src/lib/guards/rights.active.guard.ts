import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { OrganizationRights, RightsStore } from '../+state';
import { Router, UrlTree } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap, tap } from 'rxjs/operators';
import { User } from '@blockframes/auth';
import { Subscription, from } from 'rxjs';
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
    private afAuth: AngularFireAuth,
    private store: RightsStore,
    private router: Router
  ) {}

  query() {
    return this.afAuth.authState.pipe(
      switchMap(fbUser => {
        return this.fireQuery
          .doc<User>(`users/${fbUser.uid}`)
          .valueChanges()
          .pipe(
            switchMap(user => {
              // If the user is new to blockframes and doesn't have an orgId,
              // he's still able to sign up or sign in.
              if (!user.orgId) {
                return from([null]);
              }
              return this.fireQuery.fromQuery<OrganizationRights>(rightsActiveQuery(user.orgId));
            })
          );
      })
    );
  }

  canActivate(): Promise<boolean | UrlTree> | UrlTree {
    return new Promise(res => {
      this.subscription = this.query()
        .pipe(
          tap(entity => {
            // If there's no entity, return and don't apply transaction as the user
            // doesn't belong to an organization yet.
            if (!entity) {
              return;
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
