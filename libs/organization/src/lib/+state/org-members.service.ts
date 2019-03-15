import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { OrgMembersStore } from './org-members.store';
import { Organization, OrgMember } from './organization.model';
import { OrganizationService } from './organization.service';

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
    // TODO: handle id changes
    this.collection(orgID)
      .valueChanges()
      .subscribe(xs => {
        const ids = xs.userIds;
        const items = ids.map(id => ({ id, role: 'ROLE: TBD' }));
        this.store.set(items);
      });
  }

  private collection(orgID: string): AngularFirestoreDocument<Organization> {
    return this.firestore
      .collection('orgs')
      .doc(orgID);
  }
}
