import { Injectable } from '@angular/core';
import { UserRole, createDocPermissions, PermissionsDocument } from './permissions.firestore';
import { Permissions } from './permissions.model';
import { CollectionService, CollectionConfig, AtomicWrite } from 'akita-ng-fire';
import type firebase from 'firebase';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { UserService } from '@blockframes/user/+state/user.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthQuery, AuthService } from '@blockframes/auth/+state';
import { combineLatest } from 'rxjs';
import { ActiveState, EntityState } from '@datorama/akita';

interface PermissionsState extends EntityState<Permissions>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'permissions' })
export class PermissionsService extends CollectionService<PermissionsState> {
  readonly useMemorization = true;

  // The whole permissions document for organization of the current logged in user.
  permissions: Permissions;
  permissions$ = this.authService.profile$.pipe(
    switchMap(user => this.valueChanges(user.orgId)),
    tap(permissions => this.permissions = permissions)
  );

  // Checks if the connected user is superAdmin of his organization.
  public isSuperAdmin$ = combineLatest([
    this.authService.profile$,
    this.permissions$,
  ]).pipe(
    map(([user, p]) => p?.roles[user.uid] === 'superAdmin'),
    tap(isSuperAdmin => this.isSuperAdmin = isSuperAdmin)
  );
  public isSuperAdmin: boolean;

  // Checks if the connected user is admin of his organization.
  public isAdmin$ = combineLatest([
    this.authService.profile$,
    this.permissions$,
    this.isSuperAdmin$,
  ]).pipe(
    map(([user, p, isSuperAdmin]) => isSuperAdmin || p?.roles[user.uid] === 'admin'),
    tap(isAdmin => this.isAdmin = isAdmin)
  )
  public isAdmin: boolean;


  constructor(
    private organizationQuery: OrganizationQuery,
    private authService: AuthService,
    private userService: UserService,
    private auth: AuthQuery,
  ) {
    super();
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

  /** Checks if the user is admin of his organization. */
  public isUserAdmin(userId: string = this.auth.userId): boolean {
    return this.permissions.roles[userId] === 'admin' || this.isUserSuperAdmin(userId);
  }

  /** Checks if the user is superAdmin of his organization. */
  private isUserSuperAdmin(userId: string): boolean {
    return this.permissions.roles[userId] === 'superAdmin';
  }
}
