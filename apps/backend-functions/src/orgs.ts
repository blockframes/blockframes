import { difference } from 'lodash';

/**
 * Organization-related code,
 *
 * Right now this is solely used to update our algolia index (full-text search on org names).
 */
import { functions, db, getUser } from './internals/firebase';
import { deleteObject, storeSearchableOrg } from './internals/algolia';
import { sendMail, sendMailFromTemplate } from './internals/email';
import { organizationCreated, organizationWasAccepted, organizationRequestedAccessToApp, organizationAppAccessChanged } from './templates/mail';
import { OrganizationDocument, PublicUser, PermissionsDocument } from './data/types';
import { algolia } from './environments/environment';
import { NotificationType } from '@blockframes/notification/types';
import { triggerNotifications, createNotification } from './notification';
import { app, module, getAppName } from '@blockframes/utils/apps';
import { getAdminIds, getAppUrl, getOrgAppKey, getDocument, createPublicOrganizationDocument, createPublicUserDocument, getFromEmail } from './data/internals';
import { ErrorResultResponse } from './utils';
import { cleanOrgMedias } from './media';

/** Create a notification with user and org. */
function notifUser(toUserId: string, notificationType: NotificationType, org: OrganizationDocument, user: PublicUser) {
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

    const notifications = after.userIds.map(userId => notifUser(userId, 'memberAddedToOrg', after, userAdded));
    return triggerNotifications(notifications);

    // Member removed
  } else if (before.userIds.length > after.userIds.length) {
    const userRemovedId = difference(before.userIds, after.userIds)[0];
    const userSnapshot = await db.doc(`users/${userRemovedId}`).get();
    const userRemoved = userSnapshot.data() as PublicUser;

    await removeMemberPermissionsAndOrgId(userRemoved);

    const notifications = after.userIds.map(userId => notifUser(userId, 'memberRemovedFromOrg', after, userRemoved));
    return triggerNotifications(notifications);
  }
}

/** Checks if new org admin updated app access (possible only when org.status === 'pending' for a standard user ) */
function newAppAccessGranted(before: OrganizationDocument, after: OrganizationDocument): boolean {
  if (!!after.appAccess && before.status === 'pending' && after.status === 'pending') {
    return app.some(a => module.some(m => !before.appAccess[a]?.[m] && !!after.appAccess[a]?.[m]));
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

export async function onOrganizationCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
): Promise<any> {
  const org = snap.data() as OrganizationDocument;

  if (!org?.denomination?.full) {
    console.error('Invalid org data:', org);
    throw new Error('organization update function got invalid org data');
  }
  const emailRequest = await organizationCreated(org);
  const from = await getFromEmail(org);
  return Promise.all([
    // Send a mail to c8 admin to inform about the created organization
    sendMail(emailRequest, from),
    // Update algolia's index
    storeSearchableOrg(org)
  ]);
}

export async function onOrganizationUpdate(change: functions.Change<FirebaseFirestore.DocumentSnapshot>): Promise<any> {
  const before = change.before.data() as OrganizationDocument;
  const after = change.after.data() as OrganizationDocument;

  if (!before || !after || !after.denomination.full) {
    console.error('Invalid org data, before:', before, 'after:', after);
    throw new Error('organization update function got invalid org data');
  }

  // Update algolia's index
  if (before.denomination.full !== after.denomination.full) {
    throw new Error('Organization name cannot be changed !'); // this will require to change the org ENS name, for now we throw to prevent silent bug
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
    const from = await getFromEmail(after);
    await sendMailFromTemplate(organizationWasAccepted(admin.email, admin.firstName, urlToUse), from);

    // Send a notification to the creator of the organization
    const notification = createNotification({
      // At this moment, the organization was just created, so we are sure to have only one userId in the array
      toUserId: after.userIds[0],
      organization: createPublicOrganizationDocument(before),
      type: 'organizationAcceptedByArchipelContent'
    });
    await triggerNotifications([notification]);
  }

  // @todo(#3640) 09/09/2020 : We got rid of ethers dependancies
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
  await storeSearchableOrg(after)

  return Promise.resolve(true); // no-op by default
}

export async function onOrganizationDelete(
  orgSnapshot: FirebaseFirestore.DocumentSnapshot<OrganizationDocument>,
  context: functions.EventContext
): Promise<any> {

  const org = orgSnapshot.data() as OrganizationDocument;

  await cleanOrgMedias(org);

  // Update algolia's index
  return deleteObject(algolia.indexNameOrganizations, context.params.orgID);
}

export const accessToAppChanged = async (
  orgId: string
): Promise<ErrorResultResponse> => {

  const adminIds = await getAdminIds(orgId);
  const admins = await Promise.all(adminIds.map(id => getUser(id)));
  const from = await getFromEmail(orgId);
  const appKey = await getOrgAppKey(orgId);
  const appName = getAppName(appKey);
  const appUrl = await getAppUrl(orgId);

  await Promise.all(admins.map(admin => {
    const template = organizationAppAccessChanged(admin, appName.label, appUrl);
    return sendMailFromTemplate(template, from)
  }));

  return {
    error: '',
    result: 'OK'
  };
}
