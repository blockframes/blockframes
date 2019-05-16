import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { OrganizationStore, Organization } from '../+state';
import { AuthQuery } from '@blockframes/auth';
import { switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';

const organizationQuery = (uid: string): Query<Organization[]> => ({
  path: `orgs`,
  queryFn: ref => ref.where('userIds', 'array-contains', uid)
});

@Injectable({ providedIn: 'root' })
export class OrganizationListGuard extends StateListGuard<Organization> {
  urlFallback = 'layout';

  constructor(
    private fireQuery: FireQuery,
    private afAuth: AngularFireAuth,
    store: OrganizationStore,
    router: Router
  ) {
    super(store, router);
  }

  get query() {
    return this.afAuth.authState
      .pipe(switchMap(user => this.fireQuery.fromQuery<Organization[]>(organizationQuery(user.uid))));
  }
}
