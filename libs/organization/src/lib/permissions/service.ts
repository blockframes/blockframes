import { Injectable } from '@angular/core';
import type firestore from 'firebase/firestore';
import { UserService } from '@blockframes/user/service';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/service';
import { combineLatest, Observable, of } from 'rxjs';
import { createDocPermissions, PermissionsDocument, UserRole, Permissions } from '@blockframes/model';
import { doc, getDoc } from 'firebase/firestore';
import { AtomicWrite } from 'ngfire';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';


@Injectable({ providedIn: 'root' })
export class PermissionsService extends BlockframesCollection<Permissions> {
  readonly path = 'permissions';

  // The whole permissions document for organization of the current logged in user.
  permissions: Permissions;
  permissions$: Observable<Permissions> = this.authService.profile$.pipe(
    switchMap(user => user?.orgId ? this.valueChanges(user.orgId) : of(undefined)),
    tap(permissions => this.permissions = permissions)
  );

  // Checks if the connected user is superAdmin of his organization.
  public isSuperAdmin$ = combineLatest([
    this.authService.profile$,
    this.permissions$,
  ]).pipe(
    map(([user, p]) => user?.uid && p?.roles[user?.uid] === 'superAdmin')
  );

  // Checks if the connected user is admin of his organization.
  public isAdmin$ = combineLatest([
    this.authService.profile$,
    this.permissions$,
    this.isSuperAdmin$,
  ]).pipe(
    map(([user, p, isSuperAdmin]) => isSuperAdmin || p?.roles[user?.uid] === 'admin')
  )

  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {
    super();
  }

  /**
   * Takes a document (movie or event), create relative permissions
   * and add them to documentPermissions subcollection.
   * @param doc
   * @param write
   * @param organizationId
   */
  public addDocumentPermissions(docId: string, write: AtomicWrite, organizationId: string) {
    const documentPermissions = createDocPermissions({ id: docId, ownerId: organizationId });
    const documentPermissionsRef = doc(this.db, `permissions/${organizationId}/documentPermissions/${documentPermissions.id}`);
    (write as firestore.WriteBatch).set(documentPermissionsRef, documentPermissions);
  }

  public async getDocumentPermissions(docId: string, orgId: string) {
    const ref = doc(this.db, `permissions/${orgId}/documentPermissions/${docId}`);
    const permissions = await getDoc(ref);
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
  public isUserAdmin(userId: string = this.authService.uid): boolean {
    return this.permissions.roles[userId] === 'admin' || this.isUserSuperAdmin(userId);
  }

  /** Checks if the user is superAdmin of his organization. */
  private isUserSuperAdmin(userId: string): boolean {
    return this.permissions.roles[userId] === 'superAdmin';
  }
}
