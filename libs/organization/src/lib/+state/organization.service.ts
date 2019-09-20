import firebase from 'firebase';
import { Injectable } from '@angular/core';
import { switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FireQuery, Query, emailToEnsDomain, precomputeAddress, getNameFromENS, orgNameToEnsDomain } from '@blockframes/utils';
import { AuthQuery, AuthService, AuthStore, User } from '@blockframes/auth';
import { App, createAppPermissions, createPermissions, PermissionsQuery } from '../permissions/+state';
import {
  createOrganization,
  Organization,
  OrganizationMember,
  OrganizationMemberRequest,
  OrganizationOperation,
  OrganizationStatus,
  OrganizationAction
} from './organization.model';
import { OrganizationStore, DeploySteps } from './organization.store';
import { OrganizationQuery } from './organization.query';
import { getDefaultProvider } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { Log, Filter } from '@ethersproject/abstract-provider'
import { namehash, id as keccak256 } from '@ethersproject/hash';
import { network, relayer, baseEnsDomain } from '@env';
import { abi as ORGANIZATION_ABI } from '../../../../../contracts/build/Organization.json';

export const orgQuery = (orgId: string): Query<Organization> => ({
  path: `orgs/${orgId}`,
  members: (organization: Organization) =>
    organization.userIds.map(id => ({
      path: `users/${id}`
    }))
});

//--------------------------------------
//        ETHEREUM ORGS TYPES
//--------------------------------------
interface RawOperation {
  name: string;
  whitelistLength: string;
  quorum: string;
  active: boolean
}

interface RawAction {
  operationId: string;
  approvalsCount: string;
  active: boolean;
  executed: boolean;
  to: string;
  value: string;
  data: string;
}

//--------------------------------------
//           ETHEREUM TOPICS
//--------------------------------------
const newOwnerTopic         = '0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82';// 'NewOwner (index_topic_1 bytes32 node, index_topic_2 bytes32 label, address owner)' event
const newResolverTopic      = '0x335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a0';// 'NewResolver (index_topic_1 bytes32 node, address resolver)' event
const addrChangedTopic      = '0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2'; // 'AddrChanged(byte32,address)' event
const operationCreatedTopic = '0x46e4d2a30e96e4ccf9e9a058230b32ce42ee291c0f641c93de894fe65c8814b0'; // 'OperationCreated(uint256)' event
const quorumUpdatedTopic    = '0x6784e9bcb845caaa98267d7b0918f97d3d17f7cb35a05b52010f7eb587a0acb0'; // 'QuorumUpdated(uint256,uint256)' event
const memberAddedTopic      = '0xf328ac0f8bcae00933fe87ba0aa2d0d505c1df94bc9c1aa05b8441c28b74032c'; // 'MemberAdded(uint256,address)' event
const memberRemovedTopic    = '0x1c4c9d2e56d0635d11bc47c997c6909a0d7061f55cbb8f4b27386db37553191c'; // 'MemberRemoved(uint256,address)' event
const actionApprovedTopic   = '0x4eb2529dfaf5a7847cb1209edb2e7d95cf4c91f833762c3b7234771db8539f9b'; // 'ActionApproved(bytes32,address)' event
const actionExecutedTopic   = '0x27bfac0e8b79713f577faf36f24c58597bacaa93ef1b54da177e07bf10b32cb9'; // 'ActionExecuted(bytes32,bool,bytes)' event

//--------------------------------------
//     ETHEREUM ORGS EVENT FILTERS
//--------------------------------------
function getFilterFromTopics(address: string, topics: string[]): Filter {
  return {
    address,
    fromBlock: 0, toBlock: 'latest',
    topics
  }
}

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private organization$: Observable<Organization>;

  private provider: Provider; // we use a different provider than the wallet to easily manage events without having side effects on it
  private contract: Contract;

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

  //-------------------------------------------------
  //            BLOCKCHAIN PART OF ORGS
  //-------------------------------------------------

  //------------------------------
  // TUTORIAL on Ethereum events :
  //------------------------------
  // in solidity an event is declared like that :
  //    'event MemberAdded(uint256 indexed operationId, address indexed member);'
  //                ^                  ^                          ^
  //              topics[0]        topics[1]                   topics[2]
  //
  // the event name (topics[0]) is the hash of the ABI signature of the event :
  // for the previous event the ABI signature is : 'MemberAdded(uint256,address)'
  // so topics[0] is : ethers.utils.id('MemberAdded(uint256, address)') = '0x471e6d760efa350fb57b30e3eeb04f591c4442767864740e6e67f2f3df2a942b'
  // then every "indexed" params are putted into topics[1], topics[2], etc ... with a max of 4 indexed params (topics[4])
  // the others params are putted in the data field.

  //----------------------------------
  //          CHECKS/INIT
  //----------------------------------

  /** ensure that the provider exist */
  private _requireProvider() {
    if(!this.provider) {
      this.provider = getDefaultProvider(network);
    }
  }

  /** ensure that the org contract exist, (if not it waits until deploy) */
  private async _requireContract() {
    if(!this.contract) {
      this._requireProvider();
      const organizationENS = orgNameToEnsDomain(this.query.getValue().org.name);
      let address = await this.getAddress();
      await new Promise(resolve => {
        if (!address) {
          // registered
          this.provider.on(getFilterFromTopics(relayer.registryAddress, [
            newOwnerTopic,
            namehash(baseEnsDomain),
            keccak256(getNameFromENS(organizationENS))
          ]), () => {
            this.store.update({deployStep: DeploySteps.registered});
          });

          // resolved
          this.provider.on(getFilterFromTopics(relayer.registryAddress, [newResolverTopic, namehash(organizationENS)]), () => {
            this.store.update({deployStep: DeploySteps.resolved});
          });

          // ready
          this.provider.on(getFilterFromTopics(relayer.resolverAddress, [addrChangedTopic, namehash(organizationENS)]), (log: Log) => {
            address = `0x${log.data.slice(-40)}`; // extract address
            this.store.update({deployStep: DeploySteps.ready});
            resolve();
          });
        } else {
          resolve();
        }
      });
      this.provider.removeAllListeners(getFilterFromTopics(relayer.registryAddress, [newOwnerTopic, namehash(baseEnsDomain), keccak256(getNameFromENS(organizationENS))]));
      this.provider.removeAllListeners(getFilterFromTopics(relayer.registryAddress, [newResolverTopic, namehash(organizationENS)]));
      this.provider.removeAllListeners(getFilterFromTopics(relayer.resolverAddress, [addrChangedTopic, namehash(organizationENS)]));
      this.contract = new Contract(address, ORGANIZATION_ABI, this.provider);
    }
  }

  //----------------------------------
  //             GETTERS
  //----------------------------------

  public async getAddress() {
    this._requireProvider();
    const organizationENS = orgNameToEnsDomain(this.query.getValue().org.name);
    return this.provider.resolveName(organizationENS);
  }

  public async getMemberAddress(email: string) {
    this._requireProvider();
    return precomputeAddress(emailToEnsDomain(email), this.provider);
  }

  //----------------------------------
  //          LISTENERS
  //----------------------------------

  /** remove all Blockchain event listeners */
  public async removeAllListeners() {
    await this._requireContract();
    this.provider.removeAllListeners(getFilterFromTopics(this.contract.address, [operationCreatedTopic]));
    this.provider.removeAllListeners(getFilterFromTopics(this.contract.address, [quorumUpdatedTopic]));
    this.provider.removeAllListeners(getFilterFromTopics(this.contract.address, [memberAddedTopic]));
    this.provider.removeAllListeners(getFilterFromTopics(this.contract.address, [memberRemovedTopic]));
    this.provider.removeAllListeners(getFilterFromTopics(this.contract.address, [actionApprovedTopic]));
    this.provider.removeAllListeners(getFilterFromTopics(this.contract.address, [actionExecutedTopic]));
  }

  /**
   * Main function of the Blockchain part of Org,
   * it will retrieve the list of operations, pending & approved action
   * and store them in the state, it will also register Blockchain event listeners
   * to ensure that the org data stays up to date.
   */
  public async retrieveDataAndAddListeners() {
    await this._requireContract();

    // check if the listeners were already registered
    if (this.provider.listenerCount() !== 0) {
      return;
    }


    // OPERATIONS -----------------------------

    // retrieve hardcoded operation(s)
    const signingDelivery = await this.getOperationFromContract('0x0000000000000000000000000000000000000000000000000000000000000001');
    this.upsertOperation(signingDelivery);

    // retrieve every other operation
    const operationsFilter = getFilterFromTopics(this.contract.address, [operationCreatedTopic]);
    const operationLogs = await this.provider.getLogs(operationsFilter);
    const operationIds = operationLogs.map(operationLog => operationLog.topics[1]);
    operationIds.forEach(operationId =>
      this.getOperationFromContract(operationId).then(operation => this.upsertOperation(operation))
    );

    // listen for operation created
    this.provider.on(operationsFilter, async (log: Log) => {
      const operation = await this.getOperationFromContract(log.topics[1]);
      this.upsertOperation(operation);
    });

    // listen for quorum updates
    const quorumFilter = getFilterFromTopics(this.contract.address, [quorumUpdatedTopic]);
    this.provider.on(quorumFilter,(log: Log) => {
      const operationId = log.topics[1];
      const quorum = BigNumber.from(log.topics[2]).toNumber();
      this.updateOperationQuorum(operationId, quorum);
    });

    // listen for member added
    const memberAddedFilter = getFilterFromTopics(this.contract.address, [memberAddedTopic]);
    this.provider.on(memberAddedFilter, (log: Log) => {
      const operationId = log.topics[1];
      const memberAddress = log.topics[2];
      console.log(`member ${memberAddress} added to op ${operationId}`); // TODO issue#762 : link blockchain user address to org members, then call 'addOperationMember()'
    });

    // listen for member removed
    const memberRemovedFilter = getFilterFromTopics(this.contract.address, [memberRemovedTopic]);
    this.provider.on(memberRemovedFilter, (log: Log) => {
      const operationId = log.topics[1];
      const memberAddress = log.topics[2];
      console.log(`member ${memberAddress} removed from op ${operationId}`); // TODO issue#762 : link blockchain user address to org members, then call 'removeOperationMember()'
    });


    // ACTIONS -----------------------------

    // get all actions
    const actionsFilter = getFilterFromTopics(this.contract.address, [actionApprovedTopic]);
    const actionLogs = await this.provider.getLogs(actionsFilter);
    const actionIds = actionLogs.map(log => log.topics[1]); // topics[1] contain the actions ids : "ActionApproved( **bytes32 indexed actionId**, address indexed member);"
    actionIds
      .reduce((acc, curr) => acc.includes(curr) ? acc : [...acc, curr], []) // remove duplicate entries
      .forEach(actionId => this.getActionFromContract(actionId).then(action => this.upsertAction(action)));

    // listen for approvals
    this.provider.on(actionsFilter, async(log: Log) => {
      const action = await this.getActionFromContract(log.topics[1]);
      this.upsertAction(action);
    });

    // listen for execution
    const executeFilter = getFilterFromTopics(this.contract.address, [actionExecutedTopic]);
    this.provider.on(executeFilter, async(log: Log) => {
      const action = await this.getActionFromContract(log.topics[1]);
      this.upsertAction(action);
    });
  }

  //----------------------------------
  //          OPERATIONS
  //----------------------------------

  /**
   * Retrieve the minimal infos of an operation from the blockchain,
   * then enrich those infos to return a full `OrganizationOperation` object
   */
  public async getOperationFromContract(operationId: string) {
    await this._requireContract();

    const rawOperation: RawOperation = await this.contract.getOperation(operationId);
    const operation: OrganizationOperation = {
      id: operationId,
      name: rawOperation.name,
      quorum: BigNumber.from(rawOperation.quorum).toNumber(),
      members: [],
    };

    // re construct members list
    const promises: Promise<number>[] = [];
    this.query.getValue().org.members
      .filter(member => !this.permissionsQuery.isUserSuperAdmin(member.uid))
      .forEach(member => {
        const promise = precomputeAddress(emailToEnsDomain(member.email), this.provider)
          .then((address): boolean => this.contract.isWhitelisted(address, operationId))
          .then(isWhiteListed => isWhiteListed ? operation.members.push(member) : -1);
        promises.push(promise);
      });

    await Promise.all(promises);
    return operation;
  }

  /** create a newOperation in the state, or update it if it already exists */
  private async upsertOperation(newOperation: OrganizationOperation) {
    let { operations } = this.query.getValue().org; // get every operations

    if(!operations) {
      operations = [];
    }

    // add the updated operation to the operations list
    // we could not use `operations.push(newOperation)` directly otherwise the operation will have been duplicated
    const newOperations = [
      ...operations.filter(currentOperation => currentOperation.id !== newOperation.id),// get all operations except the one we want to upsert
      newOperation
    ]
    // update the store
    this.store.update(state => {
      return {
        ...state, // keep everything of the state
        org: { ...state.org, operations: newOperations }, // update only the operations array
      }
    });
  }

  /** modify the quorum of an org in the state */
  updateOperationQuorum(id: string, newQuorum: number) {
    const operation = this.query.getOperationById(id);
    if (!operation) throw new Error('This operation doesn\'t exists');
    return this.upsertOperation({
      ...operation,
      quorum: newQuorum
    });
  }

  /** add a member to an operation in the state */
  addOperationMember(id: string, newMember: OrganizationMember) {
    const operation = this.query.getOperationById(id);
    if (!operation) throw new Error('This operation doesn\'t exists');

    const memberExists = operation.members.some(member => member.uid === newMember.uid);
    if (!!memberExists) throw new Error('This member is already a signer of this operation');

    return this.upsertOperation({
      ...operation,
      members: [...operation.members, newMember]
    });
  }

  /** remove a member form an operation in the state */
  removeOperationMember(id: string, memberToRemove: OrganizationMember) {
    const operation = this.query.getOperationById(id);
    if (!operation) throw new Error('This operation doesn\'t exists');

    const members = operation.members.filter(member => member.uid !== memberToRemove.uid);
    const newOperation = { ...operation, members };

    return this.upsertOperation(newOperation);
  }

  //----------------------------------
  //              ACTIONS
  //----------------------------------

  public async getActionFromContract(actionId: string) {
    await this._requireContract();

    const rawAction: RawAction = await this.contract.getAction(actionId);
    const action: OrganizationAction = {
      id: actionId,
      opId: rawAction.operationId,
      name: '[Unknown Action]',
      isApproved: rawAction.executed,
      signers: [],
    };

    // retrieve approval date if the action was executed
    const approvalDate = await this.getActionApprovalDate(actionId);
    if (!! approvalDate) {
      action.approvalDate = approvalDate;
    }

    // retrieve the name from firestore
    const fireAction = await this.db.collection('actions').doc(actionId).get().toPromise();
    if (!!fireAction.data() && !!fireAction.data().name) {
      action.name = fireAction.data().name;
    }

    // re construct signer list
    const promises: Promise<number>[] = [];
    this.query.getValue().org.members
      .forEach(member => {
        const promise = precomputeAddress(emailToEnsDomain(member.email), this.provider)
          .then((address): boolean => this.contract.hasApprovedAction(address, actionId))
          .then(hasApproved => hasApproved ? action.signers.push(member) : -1);
        promises.push(promise);
      });

    await Promise.all(promises);

    return action;
  }

  /** retrieve approval date if the action was executed */
  public async getActionApprovalDate(actionId: string) {
    await this._requireContract();
    return this.provider.getLogs(getFilterFromTopics(this.contract.address, [actionExecutedTopic, actionId])).then(logs => {
      if (!!logs[0]) {
        return this.provider.getBlock(logs[0].blockHash);
      }
    }).then(block => {
      if (!!block) {
        const date = new Date(block.timestamp * 1000);
        const month = date.getMonth() + 1;
         return `${date.getFullYear()}/${month < 10 ? '0' + month : month}/${date.getDate()}`
      }
    });
  }

  /** create a newOperation in the state, or update it if it already exists */
  public upsertAction(newAction: OrganizationAction) {
    let { actions } = this.query.getValue().org; // get every actions

    if(!actions) {
      actions = [];
    }

    // add the updated action to the actions list
    // we could not use `actions.push(newOperation)` directly otherwise the action will have been duplicated
    const newActions = [
      ...actions.filter(currentAction => currentAction.id !== newAction.id),// get all actions except the one we want to upsert
      newAction
    ]
    // update the store
    this.store.update(state => {
      return {
        ...state, // keep everything of the state
        org: { ...state.org, actions: newActions }, // update only the actions array
      }
    });
  }

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
