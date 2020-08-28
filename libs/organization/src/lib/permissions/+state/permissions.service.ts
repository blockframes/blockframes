import { Injectable } from '@angular/core';
import { PermissionsQuery } from './permissions.query';
import { UserRole, createDocPermissions } from './permissions.firestore';
import { PermissionsState, PermissionsStore } from './permissions.store';
import { CollectionService, CollectionConfig, AtomicWrite } from 'akita-ng-fire';
import { firestore } from 'firebase/app';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';

@Injectable({
  providedIn: 'root'
})
@CollectionConfig({ path: 'permissions' })
export class PermissionsService extends CollectionService<PermissionsState> {
  constructor(
    private query: PermissionsQuery,
    private organizationQuery: OrganizationQuery,
    store: PermissionsStore
  ) {
    super(store);
  }

  /**
   * Takes a document (movie or contract), create relative permissions
   * and add them to documentPermissions subcollection.
   * @param doc
   * @param write
   */
  public addDocumentPermissions(
    docId: string,
    write: AtomicWrite,
    organizationId: string = this.organizationQuery.getActiveId()
  ) {
    const documentPermissions = createDocPermissions({ id: docId, ownerId: organizationId });
    const documentPermissionsRef = this.db.doc(`permissions/${organizationId}/documentPermissions/${documentPermissions.id}`).ref;
    (write as firestore.WriteBatch).set(documentPermissionsRef, documentPermissions);
  }

  /** Ensures that there is always at least one super Admin in the organization. */
  private hasLastSuperAdmin(uid: string, role: UserRole) {
    if (role !== 'superAdmin' && this.query.isUserSuperAdmin(uid)) {
      const superAdminNumber = this.query.superAdminCount;
      return superAdminNumber > 1 ? true : false;
    } else {
      return true;
    }
  }

  /** Update user role. */
  public async updateMemberRole(uid: string, role: UserRole): Promise<string> {
    if (this.query.hasAlreadyThisRole(uid, role)) {
      return 'This user already has this role.';
    }
    try {
      if (!this.hasLastSuperAdmin(uid, role)) {
        throw new Error('There must be at least one Super Admin in the organization.');
      }
      await this._updateMemberRole(uid, role);
      return 'Role updated';
    } catch (error) {
      return error.message;
    }
  }

  /** Update role of a member of the organization */
  private async _updateMemberRole(uid: string, role: UserRole) {
    const orgId = this.query.getActiveId();
    const permissions = await this.getValue(orgId);
    permissions.roles[uid] = role;
    return this.update(orgId, { roles: permissions.roles });
  }
}
