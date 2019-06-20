import { Injectable } from '@angular/core';
import { StateActiveGuard, FireQuery, Query } from '@blockframes/utils';
import { OrganizationRights, RightsStore } from '../+state';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap } from 'rxjs/operators';

export const rightsActiveQuery = (orgId: string): Query<OrganizationRights> => ({
  path: `rights/${orgId}`,
  userAppRights: org => ({
    path: `rights/${org.id}/userAppRights`
  }),
  userDocRights: org => ({
    path: `rights/${org.id}/userDocRights`,
  }),
  orgDocRights: org => ({
    path: `rights/${org.id}/orgDocRights`
  })
});

@Injectable({ providedIn: 'root' })
export class RightsActiveGuard extends StateActiveGuard<OrganizationRights> {
  readonly params = ['orgId'];
  readonly urlFallback: 'layout';

  constructor(
    private fireQuery: FireQuery,
    private afAuth: AngularFireAuth,
    store: RightsStore,
    router: Router) {
    super(store, router);
  }

  query() {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        const userDoc = this.fireQuery.doc(`users/${user.uid}`)
        const userOrgId = userDoc.orgId;
        const query = rightsActiveQuery(userOrgId);
        return this.fireQuery.fromQuery<OrganizationRights>(query);
      })
    );
  }
}
