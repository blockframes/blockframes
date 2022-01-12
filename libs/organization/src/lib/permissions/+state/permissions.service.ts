import { Injectable } from '@angular/core';
import { UserRole, createDocPermissions, PermissionsDocument } from './permissions.firestore';
import { Permissions } from './permissions.model';
import { PermissionsState, PermissionsStore } from './permissions.store';
import { CollectionService, CollectionConfig, AtomicWrite } from 'akita-ng-fire';
import type firebase from 'firebase';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { UserService } from '@blockframes/user/+state';
import { switchMap, tap } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/+state';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'permissions' })
export class PermissionsService extends CollectionService<PermissionsState> {
  readonly useMemorization = true;

  permissions : Permissions;
  permissions$ = this.authService.profile$.pipe(
    switchMap(user => this.valueChanges(user.orgId)),
    tap(permissions => this.permissions = permissions)
  );

  constructor(
    private organizationQuery: OrganizationQuery,
    private authService: AuthService,
    private userService: UserService,
    store: PermissionsStore
  ) {
    super(store);
  }

  /**
   * Takes a document (movie or event), create relative permissions
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
    (write as firebase.firestore.WriteBatch).set(documentPermissionsRef, documentPermissions);
  }

  public async getDocumentPermissions(docId: string, orgId: string = this.organizationQuery.getActiveId()) {
    const permissions = await this.db.doc(`permissions/${orgId}/documentPermissions/${docId}`).ref.get();
    return createDocPermissions(permissions.data());
  }

  /** Ensures that there is always at least one super Admin in the organization. */
  public hasLastSuperAdmin(permissions: PermissionsDocument, uid: string, role: UserRole) {
    if (role !== 'superAdmin' && permissions.roles[uid] === 'superAdmin') {
      const superAdminNumber = Object.values(permissions.roles).filter(value => value === 'superAdmin').length;
      return superAdminNumber > 1 ? true : false;
    } else {
      return true;
    }
  }

  /** Update user role. */
  public async updateMemberRole(uid: string, role: UserRole, _orgId?: string): Promise<string> {
    const orgId = _orgId || (await this.userService.getValue(uid)).orgId;
    const permissions = await this.getValue(orgId);
    if (permissions.roles[uid] === role) {
      return 'This user already has this role.';
    }
    try {
      if (!this.hasLastSuperAdmin(permissions, uid, role)) {
        throw new Error('There must be at least one Super Admin in the organization.');
      }
      /** Update role of a member of the organization */
      permissions.roles[uid] = role;
      await this.update(orgId, { roles: permissions.roles });
      return 'Role updated';
    } catch (error) {
      return error.message;
    }
  }
}
