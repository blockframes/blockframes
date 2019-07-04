import { Injectable } from '@angular/core';
import { createOrganization, Organization, OrgMember } from './organization.model';
import { OrganizationStore } from './organization.store';
import { FireQuery } from '@blockframes/utils';
import { AuthStore, User } from '@blockframes/auth';
import { createPermissions, App, createAppPermissions } from '../permissions';
import { OrganizationQuery } from './organization.query';
import { PermissionsQuery } from '../permissions/+state';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  constructor(
    private store: OrganizationStore,
    private query: OrganizationQuery,
    private permissionsQuery: PermissionsQuery,
    private authStore: AuthStore,
    private db: FireQuery
  ) {}

  /** Add a new user to the organization */
  public addMember(member: OrgMember) {
    const orgId = this.query.getValue().org.id;
    const permissions = this.permissionsQuery.getValue();
    const orgDoc = this.db.doc(`orgs/${orgId}`);
    const permissionsDoc = this.db.doc(`permissions/${orgId}`);
    const userDoc = this.db.doc(`users/${member.id}`);

    this.db.firestore
      .runTransaction(async tx => {
        // Update the org
        // Note: we don't use the store because we need to access fresh data IN the transaction
        const org = await tx.get(orgDoc.ref);
        const { userIds } = org.data();
        const nextUserIds = [...userIds, member.id];
        const orgTransaction = tx.update(orgDoc.ref, { userIds: nextUserIds });
        // Update the permissions and add the new member as an org admin
        const nextAdminsIds = [...permissions.admins, member.id];
        const permissionsTransaction = tx.update(permissionsDoc.ref, { admins: nextAdminsIds})
        // Update the user
        // TODO: Move this to the user side as we shouldn't be authorized to write in user document if we're not the concerned user
        const updateUserTransaction = tx.update(userDoc.ref, { orgId });

        return Promise.all([orgTransaction, updateUserTransaction, permissionsTransaction]);
      })
      .catch(error => {
        throw Error(error);
      });

    return member.id;
  }

  /**
   * Add a new organization to the database and create/update
   * related documents (permissions, apps permissions, user...).
   */
  public async add(org: Organization, user: User): Promise<string> {
    const orgId: string = this.db.createId();
    const newOrg: Organization = createOrganization({ ...org, id: orgId, userIds: [user.uid] });

    const orgDoc = this.db.doc(`orgs/${orgId}`);
    const permissions = createPermissions();
    const permissionsDoc = this.db.doc(`permissions/${orgId}`);
    const userDoc = this.db.doc(`users/${user.uid}`);
    const apps: App[] = [App.mediaDelivering, App.mediaFinanciers, App.storiesAndMore];

    await this.db.firestore
      .runTransaction(transaction => {
        const promises = [
          // Set the new organization in orgs collection.
          transaction.set(orgDoc.ref, newOrg),
          // Set the new organization in permissions collection.
          transaction.set(permissionsDoc.ref, permissions),
          // Update user document with the new organization id.
          transaction.update(userDoc.ref, { orgId }),
          // Initialize apps permissions documents in permissions apps sub-collection.
          ...apps.map(app => {
            const newApp = this.db.doc(`permissions/${orgId}/userAppsPermissions/${app}`);
            const appPermissions = createAppPermissions(app);
            return transaction.set(newApp.ref, appPermissions);
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
