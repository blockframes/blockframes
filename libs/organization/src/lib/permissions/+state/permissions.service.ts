import { Injectable } from '@angular/core';
import { BFDoc } from '@blockframes/utils';
import { PermissionsQuery } from './permissions.query';
import { Organization } from '../../+state';
import { OrganizationMember } from '../../member/+state/member.model';
import { createOrganizationDocPermissions, createUserDocPermissions, UserRole } from './permissions.firestore';
import { PermissionsState, PermissionsStore } from './permissions.store';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';

@Injectable({
  providedIn: 'root'
})
@CollectionConfig({ path: 'permissions'})
export class PermissionsService extends CollectionService<PermissionsState> {
  constructor(private query: PermissionsQuery, store: PermissionsStore) {
    super(store)
  }

  //////////////////////
  // DOC TRANSACTIONS //
  //////////////////////

  /** Create a transaction for the document and add document permissions (organization document permissions and shared document permissions) at the same time */
  public async createDocAndPermissions<T>(
    document: BFDoc,
    organization: Organization,
    tx: firebase.firestore.Transaction
  ) {
    const promises = [];
    const orgDocPermissions = createOrganizationDocPermissions({id: document.id, ownerId: organization.id});
    const userDocPermissions = createUserDocPermissions({id : document.id});

    const orgDocPermissionsRef = this.db.doc<T>(`permissions/${organization.id}/orgDocsPermissions/${document.id}`).ref;
    promises.push(tx.set(orgDocPermissionsRef, orgDocPermissions));

    const userDocPermissionsRef = this.db.doc<T>(`permissions/${organization.id}/userDocsPermissions/${document.id}`).ref;
    promises.push(tx.set(userDocPermissionsRef, userDocPermissions));

    const documentRef = this.db.doc<T>(`${document._type}/${document.id}`).ref;
    promises.push(tx.set(documentRef, document));

    return Promise.all(promises);
  }

  /** Update roles of members of the organization */
  public async updateMembersRole(organizationMembers: OrganizationMember[]) {
    const orgId = this.query.getActiveId();
    const permissions = await this.getValue(orgId);

    organizationMembers.forEach(({ uid, role }) => {
      // Case of role = 'superAdmin': we remove the member id from members/admins and insert it in superAdmins
      if (role === UserRole.superAdmin) {
        delete permissions.roles[uid];
        permissions.roles[uid] = UserRole.superAdmin;
      }
      // Case of role = 'admin': we remove the member id from superAdmins/members and insert it in admins
      if (role === UserRole.admin) {
        delete permissions.roles[uid];
        permissions.roles[uid] = UserRole.admin;
      }
      // Case of role = 'member': we remove the member id from admins/superAdmins and insert it in members
      if (role === UserRole.member) {
        delete permissions.roles[uid];
        permissions.roles[uid] = UserRole.member;
      }
    });

    return this.update(orgId, { roles: permissions.roles })
  }
}
