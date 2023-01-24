import { Injectable } from '@angular/core';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/service';
import { UserService } from '@blockframes/user/service';
import {
  OrganizationMember,
  PublicUser,
  User,
  Movie,
  Organization,
  createOrganization,
  createPermissions,
  UserRole,
  createPublicUser,
  createDocumentMeta,
  App,
  Module,
  createOrgAppAccess
} from '@blockframes/model';
import { PermissionsService } from '@blockframes/permissions/service';
import { AnalyticsService } from '@blockframes/analytics/service';
import { combineLatest, Observable, of } from 'rxjs';
import { DocumentSnapshot, where } from 'firebase/firestore';
import { CallableFunctions, WriteOptions } from 'ngfire';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class OrganizationService extends BlockframesCollection<Organization> {
  readonly path = 'orgs';

  // Organization of the current logged in user or undefined if user have no org
  org: Organization; // For this to be defined, one of the observable below must be called before
  org$: Observable<Organization> = this.authService.profile$.pipe(
    switchMap((user) => (user?.orgId ? this.valueChanges(user.orgId) : of(undefined))),
    tap((org) => (this.org = org))
  );

  // Organization of the current logged in user
  currentOrg$: Observable<Organization> = this.authService.profile$.pipe(
    filter((user) => !!user),
    switchMap((user) => (user.orgId ? this.valueChanges(user.orgId) : of(undefined))),
    filter((org) => {
      this.org = org;
      return !!org;
    })
  );

  // Org's members of the current logged in user
  public members$ = this.currentOrg$.pipe(
    map((org) => org.userIds),
    switchMap((userIds) => this.userService.valueChanges(userIds))
  );

  // Org's members of the current logged in user with permissions
  public membersWithRole$: Observable<OrganizationMember[]> = combineLatest([
    this.members$,
    this.permissionsService.permissions$,
  ]).pipe(
    map(([members, permissions]) => {
      // Get the role of each member in permissions.roles and add it to member.
      return members.map((member) => ({ ...member, role: permissions.roles[member.uid] }));
    })
  );

  notifyAppAccessChange = this.functions.prepare<{ orgId, app }, unknown>('onAccessToAppChanged');

  requestAppAccess = this.functions.prepare<{ app: App, module: Module, orgId: string }, unknown>('requestFromOrgToAccessApp');

  constructor(
    private functions: CallableFunctions,
    private userService: UserService,
    private permissionsService: PermissionsService,
    private analytics: AnalyticsService,
    private authService: AuthService,
  ) {
    super();
  }

  public async getOrgIdFromName(orgName: string) {
    // @TODO #6908 a better solution for this should be found.
    const [org] = await this.getValue([where('name', '==', orgName.trim())]);
    return org?.id;
  }

  /**
   * Add possible missing appAccess on org document
   * @param org
   */
  protected fromFirestore(snapshot: DocumentSnapshot<Organization>): Organization {
    if (!snapshot.exists()) return;
    const org = super.fromFirestore(snapshot);
    return {
      ...org,
      appAccess: createOrgAppAccess(org?.appAccess),
    };
  }

  cleanOrganization(org: Organization) {
    if (org.name) org.name = org.name.trim();
    return org;
  }

  /**
   * Triggered when we add a new organization
   * create related documents (permissions, apps permissions, user...).
   */
  async onCreate(org: Organization, { write }: WriteOptions) {
    const orgId: string = org.id;
    const permissions = createPermissions({
      id: orgId,
      roles: { [org.userIds[0]]: 'superAdmin' },
    });

    return Promise.all([
      this.userService.update(org.userIds[0], { orgId }, { write }),
      this.permissionsService.add(permissions, { write }),
    ]);
  }

  /** Add a new organization */
  public async addOrganization(
    organization: Partial<Organization>,
    createdFrom: App,
    user: User | PublicUser = this.authService.profile
  ): Promise<string> {
    const newOrganization = createOrganization({
      ...organization,
      _meta: createDocumentMeta({ createdBy: user.uid, createdFrom }),
      userIds: [user.uid],
    });

    const newOrg = this.cleanOrganization(newOrganization);
    return this.add(newOrg);
  }

  ////////////
  // MEMBER //
  ////////////

  /** Remove a member from the organization. */
  public async removeMember(uid: string) {
    const orgId = (await this.userService.getValue(uid)).orgId;
    const permissions = await this.permissionsService.getValue(orgId);
    const superAdminNumber = Object.values(permissions.roles).filter(
      (value) => value === 'superAdmin'
    ).length;
    const role = permissions.roles[uid];
    if (role === 'superAdmin' && superAdminNumber <= 1) {
      throw new Error("You can't remove the last Super Admin.");
    }

    const org = await this.getValue(orgId);
    const userIds = org.userIds.filter((userId) => userId !== uid);
    return this.update(orgId, { userIds });
  }

  public async getMembers(_org: string | Organization, options?: { removeConcierges: boolean, hideEmails?: boolean }): Promise<PublicUser[]> {
    const org = typeof _org === 'string' ? await this.getValue(_org) : _org;
    const promises = org.userIds.map((uid) => this.userService.getValue(uid));
    const users = await Promise.all(promises);
    return users.map((u) => createPublicUser(u))
      .filter(member => options?.removeConcierges ? !member.email.includes('concierge+') : true)
      .map(member => options?.hideEmails ? ({ ...member, hideEmail: true }) : member);
  }

  public async getMemberRole(_org: Organization | string, uid): Promise<UserRole> {
    const org = typeof _org === 'string' ? await this.getValue(_org) : _org;
    const role = await this.permissionsService.getValue(org.id);
    return role.roles[uid];
  }

  //////////////////
  /// WISHLIST STUFF
  //////////////////

  /**
   *
   * @param movie
   */
  public async updateWishlist(movie: Movie) {
    const orgState = this.org;
    let wishlist = Array.from(new Set([...orgState.wishlist])) || [];
    if (wishlist.includes(movie.id)) {
      wishlist = orgState.wishlist.filter(id => id !== movie.id);
      this.analytics.addTitle('removedFromWishlist', movie);
    } else {
      wishlist.push(movie.id);
      this.analytics.addTitle('addedToWishlist', movie);
    }

    this.update(orgState.id, { wishlist });
  }

  public isInWishlist(movieId: string): Observable<boolean> {
    return this.currentOrg$.pipe(map((org) => org.wishlist.includes(movieId)));
  }
}
