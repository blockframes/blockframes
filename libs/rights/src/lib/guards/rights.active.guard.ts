import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { OrganizationRights, RightsStore } from '../+state';
import { Router, UrlTree } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap, tap } from 'rxjs/operators';
import { User } from '@blockframes/auth';
import { Subscription } from 'rxjs';
import { applyTransaction } from '@datorama/akita';

export const rightsActiveQuery = (orgId: string): Query<OrganizationRights> => ({
  path: `rights/${orgId}`,
  userAppsRights: (org: OrganizationRights) => ({
    path: `rights/${org.orgId}/userAppRights`
  }),
  userDocsRights: (org: OrganizationRights) => ({
    path: `rights/${org.orgId}/userDocRights`,
  }),
  orgDocsRights: (org: OrganizationRights) => ({
    path: `rights/${org.orgId}/orgDocRights`
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
    private router: Router) {}

  query() {
    return this.afAuth.authState.pipe(
      switchMap(fbUser => {
        return this.fireQuery.doc<User>(`users/${fbUser.uid}`).valueChanges()
          .pipe(
            switchMap(user => this.fireQuery.fromQuery<OrganizationRights>(rightsActiveQuery(user.orgId)) )
          );
      }
    ))
  }

  canActivate(): Promise<boolean | UrlTree> | UrlTree {
    try {
    return new Promise((res, rej) => {
      this.subscription = this.query().pipe(
        tap(entity => applyTransaction(() => {
          this.store.upsert(entity[this.store.idKey], entity);
          this.store.setActive(entity[this.store.idKey]);
        }))
      ).subscribe({
        next: result => res(!!result),
        error: err => res(this.router.parseUrl(this.urlFallback))
      });
    })
  } catch(err) {
    return this.router.parseUrl(this.urlFallback);
  }
  }

  canDeactivate() {
    this.subscription.unsubscribe();
    return true;
  }
}
