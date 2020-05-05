import { Injectable } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth/+state';
import {
  Organization,
  createOrganization,
  OrganizationDocument,
  formatWishlistFromFirestore
} from './organization.model';
import { OrganizationStore, OrganizationState } from './organization.store';
import { OrganizationQuery } from './organization.query';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import { createPermissions } from '../../permissions/+state/permissions.model';
import { firestore } from 'firebase/app';
import { toDate } from '@blockframes/utils/helpers';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'orgs' })
export class OrganizationService extends CollectionService<OrganizationState> {

  constructor(
    private query: OrganizationQuery,
    public store: OrganizationStore,
    private authQuery: AuthQuery,
    private functions: AngularFireFunctions,
  ) {
    super(store);
  }

  public async orgNameExist(orgName: string) {
    // @TODO #2650 use publicOrg since we can not let anyone retreive the whole organization component
    /*const orgs = await this.getValue(ref => ref.where('denomination.full', '==', orgName));
    return orgs.length !== 0;*/
    return false;
  }

  syncOrgActive() {
    return this.authQuery.user$.pipe(
      switchMap(user => this.syncActive({ id: user.orgId }))
    );
  }

  /** Triggered when you remove an organization that has just been created.. */
  async onDelete() {
    const { uid } = this.authQuery.user;
    return this.db.doc(`users/${uid}`).update({ orgId: null });
  }

  /** 
   * This converts the OrganizationDocument into an Organization
   * @param org
   * @dev If this method is implemented, remove akitaPreAddEntity and akitaPreUpdateEntity on store
   */
  formatFromFirestore(org: OrganizationDocument): Organization {
    return {
      ...org,
      created: toDate(org.created), // prevent error in case the guard is wrongly called twice in a row
      updated: toDate(org.updated),
      wishlist: formatWishlistFromFirestore(org.wishlist)
    };
  }

  /**
   * Triggered when we add a new organization
   * create related documents (permissions, apps permissions, user...).
  */
  async onCreate(org: Organization, { write }: WriteOptions) {
    const user = this.authQuery.user;
    const orgId: string = org.id;
    const permissions = createPermissions({
      id: orgId,
      roles: { [user.uid]: 'superAdmin' }
    });
    const permissionsDoc = this.db.doc(`permissions/${orgId}`);
    const userDoc = this.db.doc(`users/${user.uid}`);

    // Set the new organization in permissions collection.
    (write as firestore.WriteBatch).set(permissionsDoc.ref, permissions);

    // Update user with orgId.
    return write.update(userDoc.ref, { orgId });
  }

  /** Add a new organization */
  public async addOrganization(organization: Partial<Organization>) {
    const user = this.authQuery.user;
    const newOrganization = createOrganization({
      userIds: [user.uid],
      ...organization,
    });

    return this.add(newOrganization);
  }

  // TODO(#679): somehow the updateActiveMembers array don't filter correctly
  // the id out of the activeMembersArray.
  /* public async deleteActiveSigner(member: OrganizationMember) {
  public async deleteActiveSigner(member: OrganizationMember, action: OrganizationActionOld) {
    const organizationId = this.query.id;
    const actionData = await this.db.snapshot<OrganizationActionOld>(
      `orgs/${organizationId}/actions/${action.id}`
    );
    const updatedActiveMembers = actionData.activeMembers.filter(
      _member => _member.uid !== member.uid
    );
    return this.db
      .doc<OrganizationActionOld>(`orgs/${organizationId}/actions/${action.id}`)
      .update({ activeMembers: updatedActiveMembers });
  }*/

  public async setBlockchainFeature(value: boolean) {
    const orgId = this.query.getActiveId();
    return this.update(orgId, { isBlockchainEnabled: value });
  }

  public async notifyAppAccessChange(orgId: string){
    const callOnAccessToAppChanged = this.functions.httpsCallable('onAccessToAppChanged');
    return callOnAccessToAppChanged(orgId).toPromise();
  }
}
