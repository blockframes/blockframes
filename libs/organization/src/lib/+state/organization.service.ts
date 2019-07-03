import { Injectable } from '@angular/core';
import { createOrganization, Organization, OrgMember } from './organization.model';
import { OrganizationStore } from './organization.store';
import { FireQuery } from '@blockframes/utils';
import { AuthStore, User } from '@blockframes/auth';
import { initializeOrgRights, App, initializeAppRights } from '../rights';
import { OrganizationQuery } from './organization.query';
import { RightsQuery } from '../rights/+state';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  constructor(
    private store: OrganizationStore,
    private query: OrganizationQuery,
    private rightsQuery: RightsQuery,
    private authStore: AuthStore,
    private db: FireQuery
  ) {}

  /** Add a new user to the organization */
  public addMember(member: OrgMember) {
    const org = this.query.getValue().org;
    const rights = this.rightsQuery.getValue();
    const orgDoc = this.db.doc(`orgs/${org.id}`);
    const rightsDoc = this.db.doc(`rights/${org.id}`);
    const userDoc = this.db.doc(`users/${member.id}`);

    this.db.firestore
      .runTransaction(tx => {
        // Update the org
        const { userIds } = this.query.getValue().org;
        const nextUserIds = [...userIds, member.id];
        const orgTransaction = tx.update(orgDoc.ref, { userIds: nextUserIds });
        const nextAdminsIds = [...rights.admins, member.id];
        const rightsTransaction = tx.update(rightsDoc.ref, { admins: nextAdminsIds})
        // Update the user
        // TODO: Move this to the user side as we shouldn't be authorized to write in user document if we're not the concerned user
        const updateUserTransaction = tx.update(userDoc.ref, { orgId: org.id });

        return Promise.all([orgTransaction, updateUserTransaction, rightsTransaction]);
      })
      .catch(error => {
        throw Error(error);
      });

    return member.id;
  }

  /**
   * Add a new organization to the database and create/update
   * related documents (rights, apps permissions, user...).
   */
  public async add(org: Organization, user: User): Promise<string> {
    const orgId: string = this.db.createId();
    const newOrg: Organization = createOrganization({ ...org, id: orgId, userIds: [user.uid] });

    const orgDoc = this.db.doc(`orgs/${orgId}`);
    const orgRights = initializeOrgRights({ orgId, superAdmins: [user.uid] });
    const orgRightsDoc = this.db.doc(`rights/${orgId}`);
    const userDoc = this.db.doc(`users/${user.uid}`);
    const apps: App[] = [App.mediaDelivering, App.mediaFinanciers, App.storiesAndMore];

    this.db.firestore
      .runTransaction(transaction => {
        const promises = [
          // Set the new organization in orgs collection.
          transaction.set(orgDoc.ref, newOrg),
          // Set the new organization in rights collection.
          transaction.set(orgRightsDoc.ref, orgRights),
          // Update user document with the new organization id.
          transaction.update(userDoc.ref, { orgId }),
          // Initialize apps permissions documents in organization apps sub-collection.
          ...apps.map(app => {
            const orgApp = this.db.doc(`rights/${orgId}/userAppsRights/${app}`);
            const appRights = initializeAppRights(app);
            return transaction.set(orgApp.ref, appRights);
          })
        ];
        return Promise.all(promises);
      })
      .catch(error => console.error(error));
    this.authStore.updateUser({ ...user, ...{ orgId } });
    return orgId;
  }

  public update(org: Partial<Organization>) {
    this.store.update(state => ({
      org: { ...state.org, ...org }
    }));
  }
}
