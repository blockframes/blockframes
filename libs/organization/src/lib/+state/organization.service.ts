import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { ID } from '@datorama/akita';
import { createOrganization, Organization } from './organization.model';
import { OrganizationStore } from './organization.store';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private collection: AngularFirestoreCollection<Organization>;

  constructor(
    private store: OrganizationStore,
    private firestore: AngularFirestore,
    private db: AngularFirestore,
  ) {
    this.collection = this.firestore.collection('orgs');
  }

  public subscribeUserOrgs(): void {
    this.collection.valueChanges()
      .subscribe(xs => this.store.set(xs));
  }

  public async add(org: Organization, userID: string): Promise<string> {
    const id: string = this.firestore.createId();
    const o: Organization = createOrganization({ ...org, id, userIds: [userID] });

    const orgDoc = this.collection.doc(id);
    const userDoc = this.firestore.collection('users').doc(userID)
    const orgRightsDoc = userDoc.collection('orgRights').doc(id);

    // @todo admin slug comes from json
    orgRightsDoc.ref.set({ orgId: id, rightNameSlug: ['admin']});

    this.db.firestore.runTransaction((transaction) => {
      return Promise.all([
        transaction.set(orgDoc.ref, o),
        transaction.set(orgRightsDoc.ref, {})
      ]);
    }).then(() => {
        console.log("Transaction successfully committed!");
    }).catch((error) => {
        console.log("Transaction failed: ", error);
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
