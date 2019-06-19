import { Injectable } from '@angular/core';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { OrgMembersStore } from './org-members.store';
import { Organization, OrgMember } from './organization.model';
import { OrganizationService } from './organization.service';
import { combineLatest, Observable } from 'rxjs';
import { map, pluck, switchMap, tap } from 'rxjs/operators';
import { FireQuery } from '@blockframes/utils';
import { OrganizationQuery } from './organization.query';
import { AuthQuery } from '@blockframes/auth';

@Injectable({ providedIn: 'root' })
export class OrgMembersService {

  constructor(
    private orgService: OrganizationService,
    private orgQuery: OrganizationQuery,
    private auth: AuthQuery,
    private store: OrgMembersStore,
    private db: FireQuery
  ) {
  }

  public async addMember(orgID: string, member: OrgMember) {
    return this.orgService.addMember(orgID, member);
  }

  public subscribe(orgID: string): Observable<OrgMember[]> {
    const pullUserAndOrgRights = (userID): Observable<OrgMember> => (
      combineLatest([
        this.db.collection('users').doc(userID)
          .get()
          .pipe(map(x => x.data())),
        this.db.collection('users').doc(userID).collection('orgRights').doc(orgID)
          .get()
          .pipe(map(x => x.data()))
      ]).pipe(map(([user, rights]): OrgMember => ({
        id: user.uid,
        email: user.email,
        roles: rights.rightNameSlug
      })))
    );

    // TODO: handle id changes
    return this.collection(orgID)
      .valueChanges()
      .pipe(
        pluck('userIds'),
        switchMap(ids => combineLatest(...ids.map(id => pullUserAndOrgRights(id)))),
        tap(xs => this.store.set(xs))
      );
  }

  public async isSuperAdmin() {
    const orgId = this.orgQuery.getActiveId();
    const userId = this.auth.userId;
    const orgRights = await this.db.snapshot<any>(`rights/${orgId}`);
    return orgRights.superAdmin === userId;
  }

  private collection(orgID: string): AngularFirestoreDocument<Organization> {
    return this.db.collection('orgs').doc(orgID);
  }
}
