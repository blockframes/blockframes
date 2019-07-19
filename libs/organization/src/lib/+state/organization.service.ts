import { Injectable } from '@angular/core';
import {
  createOrganization,
  Organization,
  OrganizationAction,
  OrganizationMember
} from './organization.model';
import { OrganizationStore } from './organization.store';
import { FireQuery } from '@blockframes/utils';
import { AuthStore, User } from '@blockframes/auth';
import { OrganizationQuery } from './organization.query';
import {
  PermissionsQuery,
  createPermissions,
  App,
  createAppPermissions
} from '../permissions/+state';
import firebase from 'firebase';

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
  public async addMember(member: OrganizationMember) {
    const orgId = this.query.getValue().org.id;
    const permissions = this.permissionsQuery.getValue();
    const organizationDoc = this.db.doc(`orgs/${orgId}`);
    const permissionsDoc = this.db.doc(`permissions/${orgId}`);
    const userDoc = this.db.doc(`users/${member.uid}`);

    await this.db.firestore
      .runTransaction(async tx => {
        // Update the organization
        // Note: we don't use the store because we need to access fresh data IN the transaction
        const org = await tx.get(organizationDoc.ref);
        const { userIds } = org.data();
        const nextUserIds = [...userIds, member.uid];
        const organizationTransaction = tx.update(organizationDoc.ref, { userIds: nextUserIds });
        // Update the permissions and add the new member as an org admin
        const nextAdminsIds = [...permissions.admins, member.uid];
        const permissionsTransaction = tx.update(permissionsDoc.ref, { admins: nextAdminsIds });
        // Update the user
        // TODO: Move this to the user side as we shouldn't be authorized to write in user document if we're not the concerned user
        const updateUserTransaction = tx.update(userDoc.ref, { orgId });

        return Promise.all([
          organizationTransaction,
          updateUserTransaction,
          permissionsTransaction
        ]);
      })
      .catch(error => {
        throw Error(error);
      });

    return member.uid;
  }

  /**
   * Add a new organization to the database and create/update
   * related documents (permissions, apps permissions, user...).
   */
  public async add(organization: Organization, user: User): Promise<string> {
    const orgId: string = this.db.createId();
    const newOrganization: Organization = createOrganization({
      ...organization,
      id: orgId,
      userIds: [user.uid]
    });
    const organizationDoc = this.db.doc(`orgs/${orgId}`);
    const permissions = createPermissions({ orgId, superAdmins: [user.uid] });
    const permissionsDoc = this.db.doc(`permissions/${orgId}`);
    const userDoc = this.db.doc(`users/${user.uid}`);
    const apps: App[] = [App.mediaDelivering, App.mediaFinanciers, App.storiesAndMore];

    // Set permissions in the first transaction
    await this.db.firestore.runTransaction(tx =>
      Promise.all([
        // Set the new organization in permissions collection.
        tx.set(permissionsDoc.ref, permissions),
        // Initialize apps permissions documents in permissions apps sub-collection.
        ...apps.map(app => {
          const newApp = this.db.doc(`permissions/${orgId}/userAppsPermissions/${app}`);
          const appPermissions = createAppPermissions(app);
          return tx.set(newApp.ref, appPermissions);
        })
      ])
    );

    // Then set organization in the second transaction (rules from permissions will apply)
    await this.db.firestore
      .runTransaction(transaction => {
        const promises = [
          // Set the new organization in orgs collection.
          transaction.set(organizationDoc.ref, newOrganization),
          // Update user document with the new organization id.
          transaction.update(userDoc.ref, { orgId })
        ];
        return Promise.all(promises);
      })
      .catch(error => console.error(error));
    this.authStore.updateUser({ ...user, ...{ orgId } });
    return orgId;
  }

  public update(organization: Partial<Organization>) {
    const organizationId = this.query.getValue().org.id;
    this.db.doc(`orgs/${organizationId}`).update(organization);
  }

  /** Returns a list of organizations whose part of name match with @param prefix */
  public async getOrganizationsByName(prefix: string): Promise<Organization[]> {
    const call = firebase.functions().httpsCallable('findOrgByName');
    return call({ prefix }).then(matchingOrganizations => matchingOrganizations.data);
  }

  // TODO(#679): somehow the updateActiveMembers array don't filter correctly
  // the id out of the activeMembersArray.
  public async deleteActiveSigner(member: OrganizationMember, action: OrganizationAction) {
    const organizationId = this.query.getValue().org.id;
    const actionData = await this.db.snapshot<OrganizationAction>(`orgs/${organizationId}/actions/${action.id}`);
    const updatedActiveMembers = actionData.activeMembers.filter(_member => _member.uid !== member.uid);
    return this.db
      .doc<OrganizationAction>(`orgs/${organizationId}/actions/${action.id}`)
      .update({activeMembers: updatedActiveMembers});
  }
}
