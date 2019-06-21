import { Injectable } from '@angular/core';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { OrgMembersStore } from './org-members.store';
import { Organization, OrgMember, OrganizationRights } from './organization.model';
import { OrganizationService } from './organization.service';
import { combineLatest, Observable } from 'rxjs';
import { map, pluck, switchMap, tap } from 'rxjs/operators';
import { FireQuery } from '@blockframes/utils';
import { OrganizationQuery } from './organization.query';
import { AuthQuery } from '@blockframes/auth';
import { RightsQuery } from 'libs/rights/src/lib/+state';

@Injectable({ providedIn: 'root' })
export class OrgMembersService {

  constructor(
    private orgService: OrganizationService,
    private orgQuery: OrganizationQuery,
    private auth: AuthQuery,
    private rightsQuery: RightsQuery,
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

  public selectOrgRights(): Observable<OrganizationRights> {
    // TODO: select user.orgId instead of active organization
    return this.orgQuery.selectActiveId().pipe(
      switchMap(id => this.db.doc<OrganizationRights>(`rights/${id}`).valueChanges)
    )
  }

  private collection(orgID: string): AngularFirestoreDocument<Organization> {
    return this.db.collection('orgs').doc(orgID);
  }

  /** Checks if the connected user is the Super Admin of his organization */
  public isSuperAdmin(): boolean {
    const superAdminId = this.rightsQuery.getActive().superAdmin;
    const userId = this.auth.userId;
    console.log(superAdminId, userId)
    return superAdminId === userId;
  }
}
