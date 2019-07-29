import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import {
  Organization,
  OrganizationService,
  OrganizationStatus,
  OrganizationStore
} from '../+state';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthQuery } from '@blockframes/auth';
import { switchMap, tap } from 'rxjs/operators';

export const orgQuery = (orgId: string): Query<Organization> => ({
  path: `orgs/${orgId}`,
  members: (organization: Organization) =>
    organization.userIds.map(id => ({
      path: `users/${id}`
    }))
  // TODO(#681): refactoring
  // actions: (organization: Organization) => ({
  //   path: `orgs/${organization.id}/actions`,
  //   // TODO(#681): remove activeMembers subscription
  //   activeMembers: (action: OrganizationAction) => {
  //     return action.activeMembers.map(id => ({
  //       path: `users/${id}`
  //     }))
  //   }
  // })
});

/** Returns an observable over organization, to be reused when you need orgs without guards */
export function orgObservable(auth: AuthQuery, db: FireQuery) {
  return auth.user$.pipe(
    switchMap(user => {
      if (!user.orgId) {
        throw new Error('User has no orgId');
      }
      return db.fromQuery<Organization>(orgQuery(user.orgId));
    })
  );
}

@Injectable({ providedIn: 'root' })
export class OrganizationGuard {
  private subscription: Subscription;

  constructor(
    private fireQuery: FireQuery,
    private auth: AuthQuery,
    private store: OrganizationStore,
    private router: Router
  ) {}

  canActivate() {
    return new Promise(res => {
      this.subscription = orgObservable(this.auth, this.fireQuery)
        .pipe(tap(organization => this.store.updateOrganization(organization)))
        .subscribe({
          next: (organization: Organization) => {
            if (!organization) {
              return res(false);
            }
            if (organization.status === OrganizationStatus.pending) {
              return res(this.router.parseUrl('layout/organization/congratulation'));
            }
            return res(true);
          },
          error: err => {
            console.log('Error: ', err);
            res(this.router.parseUrl('layout/organization'));
          }
        });
    });
  }

  canDeactivate() {
    this.subscription.unsubscribe();
    return true;
  }
}
