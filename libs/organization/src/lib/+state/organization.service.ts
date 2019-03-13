import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { ID } from '@datorama/akita';
import { createOrganization, Organization, OrgMember } from './organization.model';
import { OrganizationStore } from './organization.store';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private collection: AngularFirestoreCollection<Organization>;
  private collectionName = 'orgs';

  constructor(
    private store: OrganizationStore,
    private firestore: AngularFirestore,
    private db: AngularFirestore
  ) {
    this.collection = this.firestore.collection(this.collectionName);
  }

  public subscribeUserOrgs(uid): void {
    this.firestore
      .collection<Organization>(this.collectionName, ref => ref.where('userIds', 'array-contains', uid))
      .valueChanges()
      .subscribe(xs => this.store.set(xs));
  }

  public async addMember(orgId: string, member: OrgMember): Promise<string> {
    const orgDoc = this.collection.doc(orgId);
    const userDoc = this.firestore.collection('users').doc(member.id);
    const orgRightsDoc = userDoc.collection('orgRights').doc(orgId);

    this.db.firestore.runTransaction(async (tx) => {
      // Update the org
      const org = await tx.get(orgDoc.ref);
      const { userIds } = org.data();
      const nextUserIds = [...userIds, member.id];
      const p1 = tx.update(orgDoc.ref, { userIds: nextUserIds });

      // update the user
      const p2 = tx.set(orgRightsDoc.ref, { orgId, rightNameSlug: [member.role] });

      return Promise.all([p1, p2]);
    }).then(() => {
      console.log('Transaction successfully committed!');
    }).catch((error) => {
      console.log('Transaction failed: ', error);
    });

    return member.id;
  }

  public async add(org: Organization, userID: string): Promise<string> {
    const id: string = this.firestore.createId();
    const o: Organization = createOrganization({ ...org, id, userIds: [userID] });

    const orgDoc = this.collection.doc(id);
    const userDoc = this.firestore.collection('users').doc(userID);
    const orgRightsDoc = userDoc.collection('orgRights').doc(id);

    this.db.firestore.runTransaction((transaction) => {
      return Promise.all([
        transaction.set(orgDoc.ref, o),
        // @todo admin slug comes from json
        transaction.set(orgRightsDoc.ref, { orgId: id, rightNameSlug: ['admin'] })
      ]);
    }).then(() => {
      console.log('Transaction successfully committed!');
    }).catch((error) => {
      console.log('Transaction failed: ', error);
    });

    return id;
  }

  public update(id, org: Partial<Organization>) {
    this.store.update(id, org);
  }

  public remove(id: ID | ID[]) {
    this.store.remove(id);
  }
}
