import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { Organization, OrganizationStore } from '../+state';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthQuery } from '@blockframes/auth';
import { switchMap, tap } from 'rxjs/operators';

export const orgQuery = (orgId: string): Query<Organization> => ({
  path: `orgs/${orgId}`,
  members: (org: Organization) =>
    org.userIds.map(id => ({
      path: `users/${id}`
    })),
  templates: (org: Organization) =>
    org.templateIds.map(id => ({
      path: `templates/${id}`
    }))
});

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
      this.subscription = this.auth.user$
        .pipe(
          switchMap(user => {
            console.log('orgsguard')
            if (!user.orgId) {
              throw new Error('User has no orgId')
            };
            return this.fireQuery.fromQuery<Organization>(orgQuery(user.orgId));
          }),
          tap(org => this.store.update({org}))
        )
        .subscribe({
          next: (result: Organization) => {
            res(!!result)
          },
          error: (err) => {
            console.log('error: ' ,err)
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
