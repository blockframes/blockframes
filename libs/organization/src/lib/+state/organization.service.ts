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
    console.error(this.firestore.firestore);
    this.collection = this.firestore.collection('orgs');
  }

  public add(org: Organization): string {
    const id: string = this.firestore.createId();
    this.store.add(createOrganization({ ...org, id }));
    return id;
  }

  public update(id, org: Partial<Organization>) {
    this.store.update(id, org);
  }

  public remove(id: ID | ID[]) {
    this.store.remove(id);
  }
}
