import firebase from 'firebase';
import { Injectable } from '@angular/core';
import { FireQuery, Query } from '@blockframes/utils';
import { AuthQuery, AuthService, AuthStore, User } from '@blockframes/auth';
import { switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { App, createAppPermissions, createPermissions } from '../permissions/+state';
import {
  createOrganization,
  Organization,
  OrganizationMember,
  OrganizationMemberRequest,
  OrganizationOperation,
  OrganizationStatus
} from './organization.model';
import { OrganizationStore } from './organization.store';
import { OrganizationQuery } from './organization.query';
import { mockActions, mockOperations, mockOrgMembers } from './organization.mock';

export const orgQuery = (orgId: string): Query<Organization> => ({
  path: `orgs/${orgId}`,
  members: (organization: Organization) =>
    organization.userIds.map(id => ({
      path: `users/${id}`
    }))
  // TODO(#681): refactoring
  // actions: (organization: Organization) => ({
  //   path: `orgs/${organization.id}/actions`,
  //   // TODO(#681): remove activeMembers subscription
  //   activeMembers: (action: OrganizationAction) => {
  //     return action.activeMembers.map(id => ({
  //       path: `users/${id}`
  //     }))
  //   }
  // })
});

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private orgObservable$: Observable<Organization>;

  constructor(
    private store: OrganizationStore,
    private query: OrganizationQuery,
    // private permissionsQuery: PermissionsQuery,
    private authStore: AuthStore,
    private authService: AuthService,
    private authQuery: AuthQuery,
    private db: FireQuery
  ) {}

  /** Returns an observable over organization, to be reused when you need orgs without guards */
  public sync(): Observable<Organization> {
    // prevent creating multiple side-effecting subs
    if (this.orgObservable$) {
      return this.orgObservable$;
    }

    this.orgObservable$ = this.authQuery.user$.pipe(
      switchMap(user => {
        if (!user.orgId) {
          throw new Error('User has no orgId');
        }
        return this.db.fromQuery<Organization>(orgQuery(user.orgId));
      }),
      tap(organization => this.store.updateOrganization(organization))
    );

    return this.orgObservable$;
  }

  /** Add a new user to the organization */
  public async addMember(member: OrganizationMemberRequest) {
    const orgId = this.query.getValue().org.id;
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
  public async add(organization: Organization, user: User): Promise<string> {
    const orgId: string = this.db.createId();
    const newOrganization: Organization = createOrganization({
      ...organization,
      id: orgId,
      status: OrganizationStatus.pending,
      userIds: [user.uid]
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
    const organizationId = this.query.getValue().org.id;
    this.db.doc(`orgs/${organizationId}`).update(organization);
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
    const organizationId = this.query.getValue().org.id;
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

  //-------------------------------------------------
  //            BLOCKCHAIN PART OF ORGS
  //-------------------------------------------------

  /** create a newOperation, or update it if it already exists */
  private async upsertOperation(newOperation: OrganizationOperation) {
    const { operations } = this.query.getValue().org // get every actions

    // add the updated action to the action list
    // we could not use `operations.push(newOperation)` direclty otherwise the operation will have been duplicated
    const newOperations = [
      ...operations.filter(currentOperation => currentOperation.id !== newOperation.id),// get all operations except the one we want to upsert
      newOperation
    ]
    try {
      // send tx to the org smart-contract and wait for result // TODO replace with the real implemntation : issue 676

      // update the store
      this.store.update(state => {
        return {
          ...state, // keep everything of the state
          org: { ...state.org, operations: newOperations }, // update only the operations array
        }
      });
    } catch(err) {
      console.error('The transaction has failed :', err); // TODO better error handling : issue 671
    }
  }

  updateOperationQuorum(id: string, newQuorum: number) {
    const operation = this.query.getOperationById(id);
    if(!operation) throw new Error('This operation doesn\'t exists');
    this.upsertOperation({
      ...operation,
      quorum: newQuorum,
    });
  }

  addOperationMember(id: string, newMember: OrganizationMember) {
    const operation = this.query.getOperationById(id);
    if(!operation) throw new Error('This operation doesn\'t exists');

    const memberExists = operation.members.some(member => member.uid === newMember.uid);
    if (!!memberExists) throw new Error('This member is already a signer of this operation');

    this.upsertOperation({
      ...operation,
      members: [...operation.members, newMember],
    });
  }

  removeOperationMember(id: string, memberToRemove: OrganizationMember) {
    const operation = this.query.getOperationById(id);
    if(!operation) throw new Error('This operation doesn\'t exists');

    const members = operation.members.filter(member => member.uid !== memberToRemove.uid);
    const newOperation = { ...operation, members };

    this.upsertOperation(newOperation);
  }

  // TODO REMOVE THIS ASAP : issue 676
  public instantiateMockData() {

    const oldOrgMembers = this.query.getValue().org.members;
    const newOrgMembers = mockOrgMembers.concat(oldOrgMembers);

    this.update({actions: mockActions, operations: mockOperations, members: newOrgMembers});
  }
}
