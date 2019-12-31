import { Injectable } from '@angular/core';
import { BFDoc } from '@blockframes/utils';
import { PermissionsQuery } from './permissions.query';
import { Organization } from '../../+state';
import { OrganizationMember } from '../../member/+state/member.model';
import { createDocPermissions, UserRole, DocPermissionsDocument } from './permissions.firestore';
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

  /** Create permissions for a document */
  public async createDocumentPermissions(
    document: BFDoc,
    organization: Organization,
    tx: firebase.firestore.Transaction
  ) {

    const documentPermissions = createDocPermissions({id: document.id, ownerId: organization.id});
    const documentPermissionsRef = this.db.doc(`permissions/${organization.id}/documentPermissions/${document.id}`).ref;

    return tx.set(documentPermissionsRef, documentPermissions)
  }

  /** Update roles of members of the organization */
  public async updateMembersRole(organizationMembers: OrganizationMember[]) {
    const orgId = this.query.getActiveId();
    const permissions = await this.getValue(orgId);

    organizationMembers.forEach(({ uid, role }) => {
      switch(role) {
        case UserRole.superAdmin:
          delete permissions.roles[uid];
          permissions.roles[uid] = UserRole.superAdmin;
          break;
        case UserRole.admin:
          delete permissions.roles[uid];
          permissions.roles[uid] = UserRole.admin;
          break;
        case UserRole.member:
          delete permissions.roles[uid];
          permissions.roles[uid] = UserRole.member;
          break;
        default:
          throw new Error(`User with id : ${uid} have no role.`);
      }
    });

    return this.update(orgId, { roles: permissions.roles })
  }
}
