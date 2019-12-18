/**
 * Organization-related code,
 *
 * Right now this is solely used to update our algolia index (full-text search on org names).
 */
import { functions, db } from './internals/firebase';
import { deleteSearchableOrg, storeSearchableOrg } from './internals/algolia';
import { sendMail, sendMailFromTemplate } from './internals/email';
import { organizationCreated, organizationWasAccepted } from './assets/mail-templates';
import { OrganizationDocument, OrganizationStatus } from './data/types';
import { RelayerConfig, relayerDeployOrganizationLogic, relayerRegisterENSLogic, isENSNameRegistered } from './relayer';
import { mnemonic, relayer } from './environments/environment';
import { emailToEnsDomain, precomputeAddress as precomputeEthAddress, getProvider } from '@blockframes/ethers/helpers';
import { PublicUser } from '@blockframes/auth/types';
import { createNotification, NotificationType } from '@blockframes/notification/types';
import { App } from '@blockframes/utils/apps';
import { triggerNotifications } from './notification';

/** Create a notification with user and org. */
function notifUser(userId: string, notificationType :NotificationType, org: OrganizationDocument, user: PublicUser) {
  return createNotification({
    userId,
    type: notificationType,
    user: {
      name: user.name,
      surname: user.surname
    },
    organization: {
      id: org.id,
      name: org.name
    },
    app: App.blockframes
  });
}

/** Send notifications to all org's members when a member is added or removed. */
async function sendNotificationToUsers(before: OrganizationDocument, after: OrganizationDocument) {
  // Member added
  if (before.userIds.length < after.userIds.length) {
    const userAddedId = after.userIds.filter(userId => !before.userIds.includes(userId))[0];
    const userSnapshot = await db.doc(`users/${userAddedId}`).get();
    const userAdded = userSnapshot.data() as PublicUser;

    const notifications = after.userIds.map(userId => notifUser(userId, NotificationType.memberAddedToOrg, after, userAdded));
    return triggerNotifications(notifications);

  // Member removed
  } else if (before.userIds.length > after.userIds.length) {
    const userAddedId = before.userIds.filter(userId => !after.userIds.includes(userId))[0];
    const userSnapshot = await db.doc(`users/${userAddedId}`).get();
    const userRemoved = userSnapshot.data() as PublicUser;

    const notifications = after.userIds.map(userId => notifUser(userId, NotificationType.memberRemovedFromOrg, after, userRemoved));
    return triggerNotifications(notifications);
  }
}

export function onOrganizationCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
): Promise<any> {
  const org = snap.data();
  const orgID = context.params.orgID;

  if (!org || !org.name) {
    console.error('Invalid org data:', org);
    throw new Error('organization update function got invalid org data');
  }

  return Promise.all([
    // Send a mail to c8 admin to accept the organization
    sendMail(organizationCreated(org.id)),
    // Update algolia's index
    storeSearchableOrg(orgID, org.name)
  ]);
}

const RELAYER_CONFIG: RelayerConfig = {
  ...relayer,
  mnemonic
};
export async function onOrganizationUpdate(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
): Promise<any> {
  const before = change.before.data() as OrganizationDocument;
  const after = change.after.data() as OrganizationDocument;

  if (!before || !after || !after.name) {
    console.error('Invalid org data, before:', before, 'after:', after);
    throw new Error('organization update function got invalid org data');
  }

  // Update algolia's index
  if (before.name !== after.name) {
    throw new Error('Organization name cannot be changed !'); // this will require to change the org ENS name, for now we throw to prevent silent bug
  }

  // Send notifications when a member is added or removed
  await sendNotificationToUsers(before, after);

  // Deploy org's smart-contract
  const becomeAccepted = before.status === OrganizationStatus.pending && after.status === OrganizationStatus.accepted;
  const blockchainBecomeEnabled = before.isBlockchainEnabled === false && after.isBlockchainEnabled === true;

  const { id, userIds } = before as OrganizationDocument;
  const admin = await db.collection('users').doc(userIds[0]).get().then(adminSnapShot => adminSnapShot.data()! as PublicUser); // TODO use laurent's code after the merge of PR #698
  if (becomeAccepted) {
    // send email to let the org admin know that the org has been accepted
    await sendMailFromTemplate(organizationWasAccepted(admin.email, id, admin.name));
    const notification = createNotification({
      userId: after.userIds[0],
      type: NotificationType.organizationAccepted,
      app: App.blockframes
    });
    await triggerNotifications([notification]);
  }

  if (blockchainBecomeEnabled) {
    const orgENS = emailToEnsDomain(before.name.replace(' ', '-'), RELAYER_CONFIG.baseEnsDomain);

    const isOrgRegistered = await isENSNameRegistered(orgENS, RELAYER_CONFIG);

    if (isOrgRegistered) {
      throw new Error(`This organization has already an ENS name: ${orgENS}`);
    }

    const adminEns = emailToEnsDomain(admin.email, RELAYER_CONFIG.baseEnsDomain);
    const provider = getProvider(RELAYER_CONFIG.network);
    const adminEthAddress = await precomputeEthAddress(adminEns, provider, RELAYER_CONFIG.factoryContract);
    const orgEthAddress =  await relayerDeployOrganizationLogic(adminEthAddress, RELAYER_CONFIG);

    console.log(`org ${orgENS} deployed @ ${orgEthAddress}!`);
    const res = await relayerRegisterENSLogic({name: orgENS, ethAddress: orgEthAddress}, RELAYER_CONFIG);
    console.log('Org deployed and registered!', orgEthAddress, res['link'].transactionHash);
  }

  return Promise.resolve(true); // no-op by default
}

export function onOrganizationDelete(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
): Promise<any> {
  // Update algolia's index
  return deleteSearchableOrg(context.params.orgID);
}
