import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { createOrganization, Organization, OrgMember } from './organization.model';
import { OrganizationStore } from './organization.store';
import { FireQuery } from '@blockframes/utils';
import { App, initializeAppRights, initializeOrgRights } from '@blockframes/rights';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  constructor(
    private store: OrganizationStore,
    private db: FireQuery
  ) {}

  /** Add a new user to the organization */
  public addMember(orgId: string, member: OrgMember) {
    const orgDoc = this.db.doc(`orgs/${orgId}`);
    const userDoc = this.db.doc(`users/${member.id}`);

    this.db.firestore
      .runTransaction(async tx => {
        // Update the org
        const org = await tx.get(orgDoc.ref);
        const { userIds } = org.data();
        const nextUserIds = [...userIds, member.id];
        const orgTransaction = tx.update(orgDoc.ref, { userIds: nextUserIds });

        // Update the user
        const updateUserTransaction = tx.update(userDoc.ref, { orgId })

        return Promise.all([orgTransaction, updateUserTransaction]);
      })
      .catch(error => {throw Error(error)});

    return member.id;
  }

  /**
   * Add a new organization to the database and create/update
   * related documents (rights, apps permissions, user...).
   */
  public async add(org: Organization, userId: string): Promise<string> {
    const orgId: string = this.db.createId();
    const newOrg: Organization = createOrganization({ ...org, id: orgId, userIds: [userId] });

    const orgDoc = this.db.doc(`orgs/${orgId}`);
    const orgRights = initializeOrgRights({orgId, superAdmin: userId});
    const orgRightsDoc = this.db.doc(`rights/${orgId}`);
    const userDoc = this.db.doc(`users/${userId}`);
    const apps : App[] = [App.mediaDelivering, App.mediaFinanciers, App.storiesAndMore ]

    this.db.firestore
      .runTransaction(transaction => {

        const promises = [
          // Set the new organization in orgs collection.
          transaction.set(orgDoc.ref, newOrg),
          // Set the new organization in rights collection.
          transaction.set(orgRightsDoc.ref, { orgId, superAdmin: userId, ...orgRights }),
          // Update user document with the new organization id.
          transaction.update(userDoc.ref, { orgId }),
          // Initialize apps permissions documents in organization apps sub-collection.
          ...apps.map(app => {
            const orgApp = this.db.doc(`rights/${orgId}/userAppsRights/${app}`);
            const appRights = initializeAppRights(app)
            return transaction.set(orgApp.ref, appRights);
          })
        ]

        return Promise.all(promises);
      })
      .catch(error => {throw Error(error)});

    return orgId;
  }

  public update(id, org: Partial<Organization>) {
    this.store.update(id, org);
  }

  public remove(id: ID | ID[]) {
    this.store.remove(id);
  }
}
