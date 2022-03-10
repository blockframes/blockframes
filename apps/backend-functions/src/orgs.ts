import { difference } from 'lodash';

/**
 * Organization-related code,
 *
 * Right now this is solely used to update our algolia index (full-text search on org names).
 */
import { db } from './internals/firebase';
import { getUser } from "./internals/utils";
import { sendMail } from './internals/email';
import { organizationCreated, organizationRequestedAccessToApp } from './templates/mail';
import { PermissionsDocument, NotificationDocument, NotificationTypes } from './data/types';
import { triggerNotifications, createNotification } from './notification';
import { app, App, getOrgAppAccess, getMailSender, Module } from '@blockframes/utils/apps';
import { getAdminIds, createPublicOrganizationDocument, createPublicUserDocument, getDocument, createDocumentMeta } from './data/internals';
import { ErrorResultResponse } from './utils';
import { cleanOrgMedias } from './media';
import { Change, EventContext } from 'firebase-functions';
import { algolia, deleteObject, storeSearchableOrg, findOrgAppAccess, storeSearchableUser } from '@blockframes/firebase-utils';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { User, OrganizationDocument, PublicUser } from '@blockframes/model';
import { groupIds } from '@blockframes/utils/emails/ids';

/** Create a notification with user and org. */
function notifyUser(toUserId: string, notificationType: NotificationTypes, org: OrganizationDocument, user: PublicUser) {
  const createdFrom = getOrgAppAccess(org);
  return createNotification({
    toUserId,
    type: notificationType,
    user: createPublicUserDocument(user),
    organization: createPublicOrganizationDocument(org),
    _meta: createDocumentMeta({ createdFrom: createdFrom[0] })
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

    // Only send notification if invitations is invitation and not a request
    const invitationsSnapshot = await db
      .collection(`invitations`)
      .where('toUser.uid', '==', userAddedId)
      .where('type', '==', 'joinOrganization')
      .where('fromOrg.id', '==', after.id).get();
    if (invitationsSnapshot.docs.length) {
      const notifications = after.userIds.filter(userId => userId !== userAdded.uid).map(userId => notifyUser(userId, 'orgMemberUpdated', after, userAdded));
      return triggerNotifications(notifications);
    }

    // Member removed
  } else if (before.userIds.length > after.userIds.length) {
    const userRemovedId = difference(before.userIds, after.userIds)[0];
    const userSnapshot = await db.doc(`users/${userRemovedId}`).get();
    const userRemoved = userSnapshot.data() as PublicUser;

    await removeMemberPermissionsAndOrgId(userRemoved);

    const notifications = after.userIds.map(userId => notifyUser(userId, 'orgMemberUpdated', after, userRemoved));
    return triggerNotifications(notifications);
  }
}

export async function onOrganizationCreate(snap: FirebaseFirestore.DocumentSnapshot) {
  const org = snap.data() as OrganizationDocument;

  if (!org?.denomination?.full) {
    console.error('Invalid org data:', org);
    throw new Error('organization update function got invalid org data');
  }
  const emailRequest = await organizationCreated(org);
  const from = getMailSender(org._meta.createdFrom);

  return Promise.all([
    // Send a mail to c8 admin to inform about the created organization
    sendMail(emailRequest, from, groupIds.noUnsubscribeLink).catch(e => console.warn(e.message)),
    // Update algolia's index
    storeSearchableOrg(org)
  ]);
}

export async function onOrganizationUpdate(change: Change<FirebaseFirestore.DocumentSnapshot>) {
  const before = change.before.data() as OrganizationDocument;
  const after = change.after.data() as OrganizationDocument;

  if (!before || !after || !after.denomination.full) {
    console.error('Invalid org data, before:', before, 'after:', after);
    throw new Error('organization update function got invalid org data');
  }

  // Update algolia's index
  if (before.denomination.full !== after.denomination.full
    || before.denomination.public !== after.denomination.public) {
    for (const userId of after.userIds) {
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

  // Deploy org's smart-contract
  const becomeAccepted = before.status !== 'accepted' && after.status === 'accepted';

  if (becomeAccepted) {
    const appAccess = getOrgAppAccess(after);
    // Send a notification to the creator of the organization
    const notification = createNotification({
      // At this moment, the organization was just created, so we are sure to have only one userId in the array
      toUserId: after.userIds[0],
      organization: createPublicOrganizationDocument(before),
      type: 'organizationAcceptedByArchipelContent',
      _meta: createDocumentMeta({ createdFrom: appAccess[0] })
    });
    await triggerNotifications([notification]);
  }

  // Update algolia's index

  /* If an org gets his accepted status removed, we want to remove it also from all the indices on algolia */
  if (before.status === 'accepted' && after.status !== 'accepted') {
    const promises = app.map(access => deleteObject(algolia.indexNameOrganizations[access], after.id) as Promise<boolean>)
    await Promise.all(promises)
  }

  await storeSearchableOrg(after);

  return Promise.resolve(true); // no-op by default
}

export async function onOrganizationDelete(
  orgSnapshot: FirebaseFirestore.DocumentSnapshot<OrganizationDocument>,
  context: EventContext
) {

  const org = orgSnapshot.data() as OrganizationDocument;

  // Reset the orgId field on user document
  for (const userId of org.userIds) {
    const userSnapshot = await db.doc(`users/${userId}`).get();
    const user = userSnapshot.data() as PublicUser;
    await userSnapshot.ref.update({ ...user, orgId: null })
  }

  // Delete persmission document related to the organization
  const permissionsDoc = db.doc(`permissions/${org.id}`);
  const permissionsSnap = await permissionsDoc.get();
  await permissionsSnap.ref.delete();

  // Delete movies belonging to organization
  const movieCollectionRef = db.collection('movies').where('orgIds', 'array-contains', org.id);
  const moviesSnap = await movieCollectionRef.get();
  for (const movie of moviesSnap.docs) {
    await movie.ref.delete();
  }

  // Delete all events where organization is involved
  const eventsOwnerOrgIdCollectionRef = db.collection('events').where('ownerOrgId', '==', org.id);
  const eventsOwnerOrgIdSnap = await eventsOwnerOrgIdCollectionRef.get();
  for (const event of eventsOwnerOrgIdSnap.docs) {
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
        await contract.ref.update({ parties: contractData.parties });
      }
    }
  }

  // Remove bucket belonging to org, if any
  await db.doc(`buckets/${org.id}`).delete();

  // Clean all media for the organization
  await cleanOrgMedias(org);

  const orgAppAccess = findOrgAppAccess(org);
  // Update algolia's index
  const promises = orgAppAccess.map(appName => deleteObject(algolia.indexNameOrganizations[appName], context.params.orgID) as Promise<boolean>);

  await Promise.all(promises);

  console.log(`Organization ${org.id} removed`);
}

export const accessToAppChanged = async (
  data: { orgId: string, app: App }
): Promise<ErrorResultResponse> => {

  const adminIds = await getAdminIds(data.orgId);
  const admins = await Promise.all(adminIds.map(id => getUser(id)));
  const organization = await getDocument<OrganizationDocument>(`orgs/${data.orgId}`);
  const notifications: NotificationDocument[] = [];
  admins.map(async admin => {
    const notification = createNotification({
      toUserId: admin.uid,
      docId: admin.orgId,
      organization: createPublicOrganizationDocument(organization),
      appAccess: data.app,
      type: 'orgAppAccessChanged'
    });

    notifications.push(notification);
  });

  await triggerNotifications(notifications);

  return {
    error: '',
    result: 'OK'
  };
}

/** Send an email to C8 Admins when an organization requests to access to a new platform */
export const onRequestFromOrgToAccessApp = async (data: { app: App, module: Module, orgId: string }, context?: CallableContext) => {
  if (!!context.auth.uid && !!data.app && !!data.orgId && !!data.module) {
    const organization = await getDocument<OrganizationDocument>(`orgs/${data.orgId}`);
    const mailRequest = await organizationRequestedAccessToApp(organization, data.app, data.module);
    const from = getMailSender(data.app);
    const userDocument = await getDocument<User>(`users/${context.auth.uid}`);

    const notification = createNotification({
      toUserId: context.auth.uid,
      organization: createPublicOrganizationDocument(organization),
      user: createPublicUserDocument(userDocument),
      _meta: createDocumentMeta({ createdFrom: data.app }),
      type: 'userRequestAppAccess'
    });
    await triggerNotifications([notification]);
    await sendMail(mailRequest, from, groupIds.noUnsubscribeLink).catch(e => console.warn(e.message));
    return true;
  }
  return;
}
