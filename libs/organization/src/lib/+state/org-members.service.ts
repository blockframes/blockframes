import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { OrgMembersStore } from './org-members.store';
import { OrgMember } from './organization.model';

@Injectable({ providedIn: 'root' })
export class OrgMembersService {

  constructor(
    private store: OrgMembersStore,
    private firestore: AngularFirestore
  ) {
  }

  public async addMember(orgID: string, member: OrgMember) {
    return this.collection(orgID).add(member);
  }

  public subscribe(orgID: string): void {
    // TODO: handle id changes
    this.collection(orgID)
      .valueChanges()
      .subscribe(xs => this.store.set(xs));
  }

  private collection(orgID: string) {
    return this.firestore
      .collection('orgs').doc(orgID)
      .collection<OrgMember>('members');
  }
}
