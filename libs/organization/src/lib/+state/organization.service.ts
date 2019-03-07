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
    private firestore: AngularFirestore
  ) {
    this.collection = this.firestore.collection('orgs');
  }

  public subscribeUserOrgs(): void {
    this.collection.valueChanges()
      .subscribe(xs => this.store.set(xs));
  }

  public async add(org: Organization, userID: string): Promise<string> {
    const id: string = this.firestore.createId();
    const o: Organization = createOrganization({ ...org, id });
    // TODO: add member!
    await this.collection.doc(id).set(o);
    this.store.add(o);
    return id;
  }

  public update(id, org: Partial<Organization>) {
    this.store.update(id, org);
  }

  public remove(id: ID | ID[]) {
    this.store.remove(id);
  }
}
