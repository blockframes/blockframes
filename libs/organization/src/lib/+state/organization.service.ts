import { Injectable } from '@angular/core';
import { switchMap, map, tap } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth';
import {
  Organization,
  createOrganization,
  cleanOrganization,
  AppStatus
} from './organization.model';
import { OrganizationStore, OrganizationState } from './organization.store';
import { OrganizationQuery } from './organization.query';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import { AngularFireFunctions } from '@angular/fire/functions';
import { APPS_DETAILS } from '@blockframes/utils';
import { createPermissions, UserRole } from '../permissions/+state/permissions.model';
import { firestore } from 'firebase/app';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'orgs' })
export class OrganizationService extends CollectionService<OrganizationState> {

  constructor(
    private query: OrganizationQuery,
    store: OrganizationStore,
    private authQuery: AuthQuery,
    private functions: AngularFireFunctions
  ) {
    super(store);
  }

  public async orgNameExist(orgName: string) {
    const orgs = await this.getValue(ref => ref.where('name', '==', orgName));
    return orgs.length !== 0;
  }

  /** Sync appsDetails of store with applications that are accessible to the current organization. */
  syncAppsDetails() {
    return this.query.selectActiveId().pipe(
      switchMap(orgId => this.db.doc(`app-requests/${orgId}`).valueChanges()),
      map((appRequest = {}) => {
        return APPS_DETAILS.map(app => ({
          ...app,
          status: (appRequest[app.id] as AppStatus) || AppStatus.none
        }))
      }),
      tap(appsDetails => this.store.update({ appsDetails }))
    );
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

  formatToFirestore(org: Organization): any {
    return cleanOrganization(org);
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
      roles: { [user.uid]: UserRole.superAdmin }
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

  /** Returns a list of organizations whose part of name match with @param prefix */
  public async getOrganizationsByName(prefix: string): Promise<Organization[]> {
    const call = this.functions.httpsCallable('findOrgByName');
    return call({ prefix }).toPromise().then(matchingOrganizations => matchingOrganizations.data);
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

  /** Lets an organization request access to an application */
  public requestAccessToApp(orgId: string, appId: string): Promise<any> {
    const docRef = this.db.collection('app-requests').doc(orgId).ref;

    return this.db.firestore.runTransaction(async tx => {
      const doc = await tx.get(docRef);

      if (!doc.exists) {
        return tx.set(docRef, { [appId]: 'requested' });
      } else {
        return tx.update(docRef, { [appId]: 'requested' });
      }
    });
  }

  public async setBlockchainFeature(value: boolean) {
    const orgId = this.query.getActiveId();
    return this.update(orgId, { isBlockchainEnabled: value });
  }

  /**
   * @dev ADMIN method
   * Fetch all organizations for administration uses
   */
  public async getAllOrganizations(): Promise<Organization[]> {
    const orgs = await this.db
      .collection('orgs')
      .get().toPromise()

    return orgs.docs.map(m => createOrganization(m.data()));
  }
}
