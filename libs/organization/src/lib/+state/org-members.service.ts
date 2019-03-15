import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { OrgMembersStore } from './org-members.store';
import { Organization, OrgMember } from './organization.model';
import { OrganizationService } from './organization.service';
import { combineLatest, zip } from 'rxjs';
import { map, pluck } from 'rxjs/operators';
import { switchMap } from 'rxjs/internal/operators/switchMap';

@Injectable({ providedIn: 'root' })
export class OrgMembersService {

  constructor(
    private orgs: OrganizationService,
    private store: OrgMembersStore,
    private firestore: AngularFirestore
  ) {
  }

  public async addMember(orgID: string, member: OrgMember) {
    return this.orgs.addMember(orgID, member);
  }

  public subscribe(orgID: string): void {
    const pullUserAndOrgRights = (orgID, userID) => (
      zip(
        this.firestore.collection('users').doc(userID)
          .get()
          .pipe(map(x => x.data())),
        this.firestore.collection('users').doc(userID).collection('orgRights').doc(orgID)
          .get()
          .pipe(map(x => x.data()))
      ).pipe(map(([user, rights]): OrgMember => ({
        id: user.uid,
        email: user.email,
        roles: rights.rightNameSlug
      })))
    );

    // TODO: handle id changes
    this.collection(orgID)
      .valueChanges()
      .pipe(
        pluck('userIds'),
        switchMap(ids => combineLatest(...ids.map(id => pullUserAndOrgRights(orgID, id))))
      )
      .subscribe(xs => {
        this.store.set(xs);
      });
  }

  private collection(orgID: string): AngularFirestoreDocument<Organization> {
    return this.firestore
      .collection('orgs')
      .doc(orgID);
  }
}
