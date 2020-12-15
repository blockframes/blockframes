import { difference } from 'lodash';

/**
 * Organization-related code,
 *
 * Right now this is solely used to update our algolia index (full-text search on org names).
 */
import { db, getUser } from './internals/firebase';
import { sendMail, sendMailFromTemplate } from './internals/email';
import { organizationCreated, organizationWasAccepted, organizationRequestedAccessToApp, organizationAppAccessChanged } from './templates/mail';
import { OrganizationDocument, PublicUser, PermissionsDocument } from './data/types';
import { NotificationType } from '@blockframes/notification/types';
import { triggerNotifications, createNotification } from './notification';
import { app, modules, getAppName, getSendgridFrom } from '@blockframes/utils/apps';
import { getAdminIds, getAppUrl, getOrgAppKey, getDocument, createPublicOrganizationDocument, createPublicUserDocument, getFromEmail } from './data/internals';
import { ErrorResultResponse } from './utils';
import { cleanOrgMedias } from './media';
import { Change, EventContext } from 'firebase-functions';
import { algolia, deleteObject, storeSearchableOrg, findOrgAppAccess, hasAcceptedMovies, storeSearchableUser } from '@blockframes/firebase-utils';

/** Create a notification with user and org. */
function notifyUser(toUserId: string, notificationType: NotificationType, org: OrganizationDocument, user: PublicUser) {
  return createNotification({
    toUserId,
    type: notificationType,
    user: createPublicUserDocument(user),
    organization: createPublicOrganizationDocument(org)
  });
}

/** Remove the user's orgId and user's role in permissions. */
async function removeMemberPermissionsAndOrgId(user: PublicUser) {
  return db.runTransaction(async tx => {
    const userDoc = db.doc(`users/${user.uid}`);
    const permissionsDoc = db.doc(`permissions/${user.orgId}`);

    const permissionSnapshot = await tx.get(permissionsDoc);
    const permissions = permissionSnapshot.data() as PermissionsDocument;
    const roles = permissions.roles;
    delete roles[user.uid];

    tx.update(userDoc, { orgId: '' });
    tx.update(permissionsDoc, { roles });
  });
}

/** Send notifications to all org's members when a member is added or removed. */
async function notifyOnOrgMemberChanges(before: OrganizationDocument, after: OrganizationDocument) {
  // Member added
  if (before.userIds.length < after.userIds.length) {
    const userAddedId = difference(after.userIds, before.userIds)[0];
    const userSnapshot = await db.doc(`users/${userAddedId}`).get();
    const userAdded = userSnapshot.data() as PublicUser;

    const notifications = after.userIds.map(userId => notifyUser(userId, 'memberAddedToOrg', after, userAdded));
    return triggerNotifications(notifications);

    // Member removed
  } else if (before.userIds.length > after.userIds.length) {
    const userRemovedId = difference(before.userIds, after.userIds)[0];
    const userSnapshot = await db.doc(`users/${userRemovedId}`).get();
    const userRemoved = userSnapshot.data() as PublicUser;

    await removeMemberPermissionsAndOrgId(userRemoved);

    const notifications = after.userIds.map(userId => notifyUser(userId, 'memberRemovedFromOrg', after, userRemoved));
    return triggerNotifications(notifications);
  }
}

/** Checks if new org admin updated app access (possible only when org.status === 'pending' for a standard user ) */
function newAppAccessGranted(before: OrganizationDocument, after: OrganizationDocument): boolean {
  if (!!after.appAccess && before.status === 'pending' && after.status === 'pending') {
    return app.some(a => modules.some(m => !before.appAccess[a]?.[m] && !!after.appAccess[a]?.[m]));
  }
  return false;
}

/** Sends a mail to admin to inform that an org is waiting approval */
async function sendMailIfOrgAppAccessChanged(before: OrganizationDocument, after: OrganizationDocument) {
  if (newAppAccessGranted(before, after)) {
    // Send a mail to c8 admin to accept the organization given it's choosen app access
    const mailRequest = await organizationRequestedAccessToApp(after);
    const from = await getFromEmail(after);
    await sendMail(mailRequest, from);
  }
}

export async function onOrganizationCreate(snap: FirebaseFirestore.DocumentSnapshot): Promise<any> {
  const org = snap.data() as OrganizationDocument;

  if (!org?.denomination?.full) {
    console.error('Invalid org data:', org);
    throw new Error('organization update function got invalid org data');
  }
  const emailRequest = await organizationCreated(org);
  const from = getSendgridFrom(org._meta.createdFrom);

  if (await hasAcceptedMovies(org)) {
    org['hasAcceptedMovies'] = true;
  }

  return Promise.all([
    // Send a mail to c8 admin to inform about the created organization
    sendMail(emailRequest, from),
    // Update algolia's index
    storeSearchableOrg(org)
  ]);
}

export async function onOrganizationUpdate(change: Change<FirebaseFirestore.DocumentSnapshot>): Promise<any> {
  const before = change.before.data() as OrganizationDocument;
  const after = change.after.data() as OrganizationDocument;

  if (!before || !after || !after.denomination.full) {
    console.error('Invalid org data, before:', before, 'after:', after);
    throw new Error('organization update function got invalid org data');
  }

  // Update algolia's index
  if (before.denomination.full !== after.denomination.full
  || before.denomination.public !== after.denomination.public) {
    for(const userId of after.userIds) {
      const userDocRef = db.doc(`users/${userId}`);
      const userSnap = await userDocRef.get();
      const userData = userSnap.data() as PublicUser;
      await storeSearchableUser(userData);
    }
    console.warn('Organization\'s name has been updated, be careful !');
  }

  await cleanOrgMedias(before, after);

  // Send notifications when a member is added or removed
  await notifyOnOrgMemberChanges(before, after);

  // check if appAccess have changed
  await sendMailIfOrgAppAccessChanged(before, after);

  // Deploy org's smart-contract
  const becomeAccepted = before.status === 'pending' && after.status === 'accepted';

  const { userIds } = before as OrganizationDocument;
  const admin = await getDocument<PublicUser>(`users/${userIds[0]}`);
  if (becomeAccepted) {
    // send email to let the org admin know that the org has been accepted
    const urlToUse = await getAppUrl(after);
    const appKey = await getOrgAppKey(after);
    await sendMailFromTemplate(organizationWasAccepted(admin.email, admin.firstName, urlToUse), appKey);

    // Send a notification to the creator of the organization
    const notification = createNotification({
      // At this moment, the organization was just created, so we are sure to have only one userId in the array
      toUserId: after.userIds[0],
      organization: createPublicOrganizationDocument(before),
      type: 'organizationAcceptedByArchipelContent'
    });
    await triggerNotifications([notification]);
  }

  // @todo(#3640) 09/09/2020 : We got rid of ethers dependencies
  // const RELAYER_CONFIG: RelayerConfig = {
  //   ...relayer,
  //   mnemonic
  // };
  // const blockchainBecomeEnabled = before.isBlockchainEnabled === false && after.isBlockchainEnabled === true;
  // if (blockchainBecomeEnabled) {
  //   const orgENS = emailToEnsDomain(before.denomination.full.replace(' ', '-'), RELAYER_CONFIG.baseEnsDomain);

  //   const isOrgRegistered = await isENSNameRegistered(orgENS, RELAYER_CONFIG);

  //   if (isOrgRegistered) {
  //     throw new Error(`This organization has already an ENS name: ${orgENS}`);
  //   }

  //   const adminEns = emailToEnsDomain(admin.email, RELAYER_CONFIG.baseEnsDomain);
  //   const provider = getProvider(RELAYER_CONFIG.network);
  //   const adminEthAddress = await precomputeEthAddress(adminEns, provider, RELAYER_CONFIG.factoryContract);
  //   const orgEthAddress = await relayerDeployOrganizationLogic(adminEthAddress, RELAYER_CONFIG);

  //   console.log(`org ${orgENS} deployed @ ${orgEthAddress}!`);
  //   const res = await relayerRegisterENSLogic({ name: orgENS, ethAddress: orgEthAddress }, RELAYER_CONFIG);
  //   console.log('Org deployed and registered!', orgEthAddress, res['link'].transactionHash);
  // }

  // Update algolia's index

  /* If an org gets his accepted status removed, we want to remove it also from all the indices on algolia */
  if (before.status === 'accepted' && after.status === 'pending') {
    const promises = app.map(access => deleteObject(algolia.indexNameOrganizations[access], after.id))
    await Promise.all(promises)
  }

  if (await hasAcceptedMovies(after)) {
    after['hasAcceptedMovies'] = true;
  }

  storeSearchableOrg(after)

  return Promise.resolve(true); // no-op by default
}

export async function onOrganizationDelete(
  orgSnapshot: FirebaseFirestore.DocumentSnapshot<OrganizationDocument>,
  context: EventContext
): Promise<any> {

  const org = orgSnapshot.data() as OrganizationDocument;

  // Reset the orgId field on user document
  for (const userId of org.userIds) {
    const userSnapshot = await db.doc(`users/${userId}`).get();
    const user = userSnapshot.data() as PublicUser;
    await userSnapshot.ref.update({...user, orgId: null})
  }

  // Delete persmission document related to the organization
  const permissionsDoc = db.doc(`permissions/${org.id}`);
  const permissionsSnap = await permissionsDoc.get();
  await permissionsSnap.ref.delete();

  // Delete movies belonging to organization
  const movieCollectionRef = db.collection('movies').where('orgIds', 'array-contains', org.id);
  const moviesSnap = await movieCollectionRef.get();
  for(const movie of moviesSnap.docs) {
    await movie.ref.delete();
  }

  // Delete all events where organization is involved
  const eventsOwnerIdCollectionRef = db.collection('events').where('ownerId', '==', org.id);
  const eventsOwnerIdSnap = await eventsOwnerIdCollectionRef.get();
  for (const event of eventsOwnerIdSnap.docs) {
    await event.ref.delete();
  }

  const eventsOrganizerIdCollectionRef = db.collection('events').where('meta.organizerId', '==', org.id);
  const eventsOrganizerIdSnap = await eventsOrganizerIdCollectionRef.get();
  for (const event of eventsOrganizerIdSnap.docs) {
    await event.ref.delete();
  }

  // Delete all notifications where organization is involved
  const notifsCollectionRef = db.collection('notifications').where('organization.id', '==', org.id);
  const notifsSnap = await notifsCollectionRef.get();
  for (const notif of notifsSnap.docs) {
    await notif.ref.delete();
  }

  // Delete all invitations where organization is involved
  const invitationsFromOrgCollectionRef = db.collection('invitations').where('fromOrg.id', '==', org.id);
  const invitationsFromOrgSnap = await invitationsFromOrgCollectionRef.get();
  for (const invit of invitationsFromOrgSnap.docs) {
    await invit.ref.delete();
  }

  const invitationsToOrgCollectionRef = db.collection('invitations').where('toOrg.id', '==', org.id);
  const invitationsToOrgSnap = await invitationsToOrgCollectionRef.get();
  for (const invit of invitationsToOrgSnap.docs) {
    await invit.ref.delete();
  }

  // Update all contracts where the organization belongs to partyIds array
  const contractsCollectionRef = db.collection('contracts').where('partyIds', 'array-contains', org.id);
  const contractsSnap = await contractsCollectionRef.get();

  for (const contract of contractsSnap.docs) {
    const contractData = contract.data();
    for (const party of contractData.parties) {
      if (party.party.orgId === org.id) {
        const index = contractData.parties.indexOf(party);
        contractData.parties.splice(index, 1);
        await contract.ref.update({ parties: contractData.parties});
      }
    }
  }


  // Clean all media for the organization
  await cleanOrgMedias(org);

  const orgAppAccess = findOrgAppAccess(org);
  // Update algolia's index
  const promises = orgAppAccess.map(appName => deleteObject(algolia.indexNameOrganizations[appName], context.params.orgID));

  await Promise.all(promises);

  console.log(`Organization ${org.id} removed`);
}

export const accessToAppChanged = async (
  orgId: string
): Promise<ErrorResultResponse> => {

  const adminIds = await getAdminIds(orgId);
  const admins = await Promise.all(adminIds.map(id => getUser(id)));
  const appKey = await getOrgAppKey(orgId);
  const appUrl = await getAppUrl(orgId);

  await Promise.all(admins.map(admin => {
    const template = organizationAppAccessChanged(admin, appUrl);
    return sendMailFromTemplate(template, appKey)
  }));

  return {
    error: '',
    result: 'OK'
  };
}
