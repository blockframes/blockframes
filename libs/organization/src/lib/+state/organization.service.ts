import firebase from 'firebase';
import { Injectable } from '@angular/core';
import { switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FireQuery, Query } from '@blockframes/utils';
import { AuthQuery, AuthService, AuthStore, User } from '@blockframes/auth';
import { App, createAppPermissions, createPermissions, PermissionsQuery } from '../permissions/+state';
import {
  createOrganization,
  Organization,
  OrganizationMemberRequest,
} from './organization.model';
import { OrganizationStore } from './organization.store';
import { OrganizationQuery } from './organization.query';
import { OrganizationDocument } from './organization.firestore';

export const orgQuery = (orgId: string): Query<Organization> => ({
  path: `orgs/${orgId}`,
  members: (organization: Organization) =>
    organization.userIds.map(id => ({
      path: `users/${id}`
    }))
});

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private organization$: Observable<Organization>;

  constructor(
    private query: OrganizationQuery,
    private store: OrganizationStore,
    private permissionsQuery: PermissionsQuery,
    private authStore: AuthStore,
    private authService: AuthService,
    private authQuery: AuthQuery,
    private db: FireQuery,
  ) {}

  /** Returns an observable over organization, to be reused when you need orgs without guards */
  public sync(): Observable<Organization> {
    // prevent creating multiple side-effecting subs
    if (this.organization$) {
      return this.organization$;
    }

    this.organization$ = this.authQuery.user$.pipe(
      switchMap(user => {
        if (!user.orgId) {
          throw new Error('User has no orgId');
        }
        return this.db.fromQuery<Organization>(orgQuery(user.orgId));
      }),
      tap(organization => this.store.updateOrganization(organization))
    );

    return this.organization$;
  }

  /** Add a new user to the organization */
  public async addMember(member: OrganizationMemberRequest) {
    const orgId = this.query.id;
    // get a user or create a ghost user when needed:
    const { uid } = await this.authService.getOrCreateUserByMail(member.email); // TODO: limit the number of requests per organizations!

    // TODO: use a definitive data type
    // TODO: compare with backend-functions
    const invitation = { userId: uid, orgId, type: 'orgInvitation', state: 'pending' };

    await this.db.collection('invitations').add(invitation);

    return uid;
  }

  /**
   * Add a new organization to the database and create/update
   * related documents (permissions, apps permissions, user...).
   */
  public async add(organization: Partial<OrganizationDocument>, user: User): Promise<string> {
    const orgId: string = this.db.createId();
    const newOrganization: OrganizationDocument = createOrganization({
      id: orgId,
      userIds: [user.uid],
      ...organization,
    });
    const organizationDoc = this.db.doc(`orgs/${orgId}`);
    const permissions = createPermissions({ orgId, superAdmins: [user.uid] });
    const permissionsDoc = this.db.doc(`permissions/${orgId}`);
    const userDoc = this.db.doc(`users/${user.uid}`);
    const apps: App[] = [App.mediaDelivering, App.mediaFinanciers, App.storiesAndMore];

    // Set permissions in the first transaction
    await this.db.firestore.runTransaction(tx =>
      Promise.all([
        // Set the new organization in permissions collection.
        tx.set(permissionsDoc.ref, permissions),
        // Initialize apps permissions documents in permissions apps sub-collection.
        ...apps.map(app => {
          const newApp = this.db.doc(`permissions/${orgId}/userAppsPermissions/${app}`);
          const appPermissions = createAppPermissions(app);
          return tx.set(newApp.ref, appPermissions);
        })
      ])
    );

    // Then set organization in the second transaction (rules from permissions will apply)
    await this.db.firestore
      .runTransaction(transaction => {
        const promises = [
          // Set the new organization in orgs collection.
          transaction.set(organizationDoc.ref, newOrganization),
          // Update user document with the new organization id.
          transaction.update(userDoc.ref, { orgId })
        ];
        return Promise.all(promises);
      })
      .catch(error => console.error(error));
    this.authStore.updateUser({ ...user, ...{ orgId } });
    return orgId;
  }

  public update(organization: Partial<Organization>) {
    const organizationId = this.query.id;
    return this.db.doc(`orgs/${organizationId}`).update(organization);
  }

  /** Returns a list of organizations whose part of name match with @param prefix */
  public async getOrganizationsByName(prefix: string): Promise<Organization[]> {
    const call = firebase.functions().httpsCallable('findOrgByName');
    return call({ prefix }).then(matchingOrganizations => matchingOrganizations.data);
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
}
