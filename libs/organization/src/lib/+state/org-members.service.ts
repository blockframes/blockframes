import { Injectable } from '@angular/core';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { OrgMembersStore } from './org-members.store';
import { Organization, OrgMember } from './organization.model';
import { OrganizationService } from './organization.service';
import { combineLatest, Observable } from 'rxjs';
import { map, pluck, switchMap, tap } from 'rxjs/operators';
import { FireQuery } from '@blockframes/utils';

@Injectable({ providedIn: 'root' })
export class OrgMembersService {

  constructor(
    private orgs: OrganizationService,
    private store: OrgMembersStore,
    private db: FireQuery
  ) {
  }

  public async addMember(orgID: string, member: OrgMember) {
    return this.orgs.addMember(orgID, member);
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

  private collection(orgID: string): AngularFirestoreDocument<Organization> {
    return this.db.collection('orgs').doc(orgID);
  }
}
