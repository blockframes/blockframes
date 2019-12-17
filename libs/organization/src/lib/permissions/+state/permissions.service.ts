import { Injectable } from '@angular/core';
import { BFDoc } from '@blockframes/utils';
import { PermissionsQuery } from './permissions.query';
import { Organization } from '../../+state';
import { OrganizationMember } from '../../member/+state/member.model';
import { createDocPermissions, createUserPermissions, UserRole, DocPermissionsDocument } from './permissions.firestore';
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
    const orgDocPermissions = createDocPermissions({id: document.id, ownerId: organization.id});
    const userDocPermissions = createUserPermissions({id : document.id});

    const orgDocPermissionsRef = this.db.doc<T>(`permissions/${organization.id}/orgDocsPermissions/${document.id}`).ref;
    promises.push(tx.set(orgDocPermissionsRef, orgDocPermissions));

    const userDocPermissionsRef = this.db.doc<T>(`permissions/${organization.id}/userDocsPermissions/${document.id}`).ref;
    promises.push(tx.set(userDocPermissionsRef, userDocPermissions));

    const documentRef = this.db.doc<T>(`${document._type}/${document.id}`).ref;
    promises.push(tx.set(documentRef, document));

    return Promise.all(promises);
  }

  /**
   * Create a generic DocPermisionsDocument and add it to the database.
   * @param documentId id from the document is the same as its permissions counterpart.
   * @param organizationId id from the organization who created the document.
   */
  public createDocPermissions(documentId: string, organizationId: string) {
    const docPermissions = createDocPermissions({id: documentId, ownerId: organizationId});
    this.db
      .doc<DocPermissionsDocument>(`permissions/${organizationId}/documentPermissions/${documentId}`)
      .set(docPermissions);
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
