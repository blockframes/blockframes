import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthQuery, User } from '@blockframes/auth/+state';
import {
  Organization,
  createOrganization,
  OrganizationDocument
} from './organization.model';
import { OrganizationStore, OrganizationState } from './organization.store';
import { OrganizationQuery } from './organization.query';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import { createPermissions, UserRole } from '../../permissions/+state/permissions.model';
import { AngularFireFunctions } from '@angular/fire/functions';
import { UserService, OrganizationMember, createOrganizationMember, PublicUser } from '@blockframes/user/+state';
import { PermissionsService } from '@blockframes/permissions/+state/permissions.service';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp, App, Module, createOrgAppAccess } from '@blockframes/utils/apps';
import { createDocumentMeta, formatDocumentMetaFromFirestore } from '@blockframes/utils/models-meta';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'orgs' })
export class OrganizationService extends CollectionService<OrganizationState> {
  readonly useMemorization = true;

  private app = getCurrentApp(this.routerQuery)

  constructor(
    private query: OrganizationQuery,
    public store: OrganizationStore,
    private authQuery: AuthQuery,
    private functions: AngularFireFunctions,
    private userService: UserService,
    private permissionsService: PermissionsService,
    private routerQuery: RouterQuery,
    private analytics: FireAnalytics,
  ) {
    super(store);
  }

  public async orgNameExist(orgName: string) {
    // @TODO #6908 a better solution for this should be found.
    const orgs = await this.getValue(ref => ref.where('denomination.full', '==', orgName));
    return orgs.length !== 0;
  }


  /**
   * This converts the OrganizationDocument into an Organization
   * @param org
   * @dev If this method is implemented, remove akitaPreAddEntity and akitaPreUpdateEntity on store
   */
  formatFromFirestore(org: OrganizationDocument): Organization {
    return {
      ...org,
      appAccess: createOrgAppAccess(org.appAccess),
      _meta: formatDocumentMetaFromFirestore(org?._meta)
    };
  }

  /**
   * Triggered when we add a new organization
   * create related documents (permissions, apps permissions, user...).
  */
  async onCreate(org: Organization, { write }: WriteOptions) {
    const orgId: string = org.id;
    const permissions = createPermissions({
      id: orgId,
      roles: { [org.userIds[0]]: 'superAdmin' }
    });

    return Promise.all([
      this.userService.update(org.userIds[0], { orgId }, { write }),
      this.permissionsService.add(permissions, { write }),
    ]);
  }

  /** Add a new organization */
  public async addOrganization(organization: Partial<Organization>, createdFrom: App, user: User | PublicUser = this.authQuery.user): Promise<string> {
    const newOrganization = createOrganization({
      ...organization,
      _meta: createDocumentMeta({ createdBy: user.uid, createdFrom }),
      userIds: [user.uid],
    });

    return this.add(newOrganization);
  }

  public async setBlockchainFeature(value: boolean) {
    const orgId = this.query.getActiveId();
    return this.update(orgId, { isBlockchainEnabled: value });
  }

  public notifyAppAccessChange(orgId: string, app: App) {
    const callOnAccessToAppChanged = this.functions.httpsCallable('onAccessToAppChanged');
    return callOnAccessToAppChanged({ orgId, app }).toPromise();
  }

  public requestAppAccess(app: App, module: Module, orgId: string) {
    const f = this.functions.httpsCallable('requestFromOrgToAccessApp');
    return f({ app, module, orgId }).toPromise();
  }

  ////////////
  // MEMBER //
  ////////////

  /** Remove a member from the organization. */
  public async removeMember(uid: string) {
    const orgId = (await this.userService.getValue(uid)).orgId
    const permissions = await this.permissionsService.getValue(orgId);
    const superAdminNumber = Object.values(permissions.roles).filter(value => value === 'superAdmin').length;
    const role = permissions.roles[uid];
    if (role === 'superAdmin' && superAdminNumber <= 1) {
      throw new Error('You can\'t remove the last Super Admin.');
    }

    const org = await this.getValue(orgId);
    const userIds = org.userIds.filter(userId => userId !== uid);
    return this.update(orgId, { userIds });
  }

  public async getMembers(orgId: string): Promise<OrganizationMember[]> {
    const org = await this.getValue(orgId);
    const promises = org.userIds.map(uid => this.userService.getUser(uid));
    const users = await Promise.all(promises);
    const role = await this.permissionsService.getValue(orgId);
    return users.map(u => createOrganizationMember(u, role.roles[u.uid] ? role.roles[u.uid] : undefined));
  }

  public async getMemberRole(_org: Organization | string, uid): Promise<UserRole> {
    const org = typeof _org === 'string' ? await this.getValue(_org) : _org;
    const role = await this.permissionsService.getValue(org.id);
    return role.roles[uid];
  }

  public async uniqueOrgName(orgName: string): Promise<boolean> {
    return this.orgNameExist(orgName).then(exist => !exist);
  }

  public queryFromMovie(movie: Movie) {
    return this.valueChanges(movie.orgIds).pipe(
      map(orgs => orgs.filter(org => org.appAccess[this.app]))
    );
  }

  //////////////////
  /// WISHLIST STUFF
  //////////////////

  /**
   *
   * @param movie
   */
  public async updateWishlist(movie: Movie) {
    const orgState = this.query.getActive();
    let wishlist = Array.from(new Set([...orgState.wishlist])) || [];
    if (wishlist.includes(movie.id)) {
      wishlist = orgState.wishlist.filter(id => id !== movie.id);
      this.analytics.event('removedFromWishlist', {
        movieId: movie.id,
        movieTitle: movie.title.original
      });
    } else {
      wishlist.push(movie.id);
      this.analytics.event('addedToWishlist', {
        movieId: movie.id,
        movieTitle: movie.title.original
      });
    }

    this.update(orgState.id, { wishlist });
  }
}
