import { getDocumentSnap } from '@blockframes/firebase-utils/firebase-utils';
import { wasCreated, wasAccepted, wasDeclined, hasUserAnOrgOrIsAlreadyInvited } from './utils';
import {
  Invitation,
  Notification,
  User,
  Waterfall,
  WaterfallPermissions,
  createInternalDocumentMeta,
  createNotification,
  createPublicInvitation,
  createWaterfallPermissions
} from '@blockframes/model';
import { getDb } from '@blockframes/firebase-utils';
import { triggerNotifications } from '../../notification';
import { getAdminIds } from '../../data/internals';

/**
 * Dispatch the invitation update call depending on whether the invitation
 * was 'created', 'accepted' or 'rejected'.
 */
export async function onInvitationToWaterfallUpdate(
  before: Invitation,
  after: Invitation,
  invitation: Invitation
) {

  const notifications: Notification[] = [];
  if (wasCreated(before, after)) {
    const hasOrgOrOrgInvitation = await hasUserAnOrgOrIsAlreadyInvited([invitation.toUser.email]);
    if (!hasOrgOrOrgInvitation) {
      console.log('Invitation have already been sent along with user credentials');
      return;
    }

    // Send email to already registered user
    notifications.push(createNotification({
      toUserId: invitation.toUser.uid,
      organization: invitation.fromOrg,
      docId: invitation.waterfallId,
      invitation: createPublicInvitation(invitation),
      type: 'invitationToJoinWaterfallCreated',
      _meta: createInternalDocumentMeta({ createdFrom: 'waterfall' }) // Waterfalls are only on waterfall app
    }));

  } else if (wasAccepted(before, after) || wasDeclined(before, after)) {
    const { waterfallId, data, toUser } = invitation;

    if (wasAccepted(before, after)) await addOrgToWaterfall(toUser.uid, waterfallId, data.rightholderIds, data.isAdmin);

    // Send email to admins of org that created invitation
    const ids = await getAdminIds(invitation.fromOrg.id);

    Array.from(new Set(ids)).forEach(toUserId => {
      const notification = createNotification({
        toUserId,
        docId: invitation.waterfallId,
        invitation: createPublicInvitation(invitation),
        type: 'invitationToJoinWaterfallUpdated',
        user: invitation.toUser, // The subject that have accepted or rejected the invitation
        _meta: createInternalDocumentMeta({ createdFrom: 'waterfall' }) // Waterfalls are only on waterfall app
      });

      notifications.push(notification);
    });
  }

  return triggerNotifications(notifications);
}

/**
 * Adds user's org to waterfall document and create permissions with roles
 * @param userId 
 * @param waterfallId 
 * @param rightholderIds 
 * @param isAdmin
 * @returns 
 */
async function addOrgToWaterfall(userId: string, waterfallId: string, rightholderIds: string[], isAdmin = false) {
  const db = getDb();
  if (!waterfallId || !userId) {
    throw new Error(`missing data: userId=${userId}, waterfallId=${waterfallId}`);
  }

  return db.runTransaction(async tx => {
    const [user, waterfall] = await Promise.all([
      getDocumentSnap(`users/${userId}`, db, tx),
      getDocumentSnap(`waterfall/${waterfallId}`, db, tx)
    ]);

    const waterfallData = waterfall.data() as Waterfall;
    const userData = user.data() as User;

    if (!userData || !waterfallData) {
      console.error(
        'Something went wrong with the invitation, a required document is not set',
        userData,
        waterfallData
      );
      return;
    }

    if (!userData.orgId) {
      throw new Error(`invalid data: userId=${userId}, does not have any org`);
    }

    if (waterfallData.orgIds.includes(userData.orgId)) {
      console.debug('org:', userData.orgId, 'is already part of waterfall:', waterfallId);
      return;
    }

    const permission = await getDocumentSnap(`waterfall/${waterfallId}/permissions/${userData.orgId}`, db, tx);

    // Accept all pending invitations to the same org
    const otherInvitations = await db.collection('invitations').where('waterfallId', '==', waterfallId).where('toUser.orgId', '==', userData.orgId).get();
    for (const inv of otherInvitations.docs.filter(inv => inv.data().status === 'pending')) {
      tx.set(inv.ref, { ...inv.data(), status: 'accepted' });
    }

    console.debug('add org:', userData.orgId, 'to waterfall:', waterfallId);

    const permissionData = permission.exists ? permission.data() as WaterfallPermissions : createWaterfallPermissions({ id: userData.orgId });

    return Promise.all([
      // Update organization
      tx.set(waterfall.ref, {
        ...waterfallData,
        orgIds: Array.from(new Set([...waterfallData.orgIds, userData.orgId]))
      }),
      // Update Permissions
      tx.set(permission.ref, {
        ...permissionData,
        rightholderIds: [rightholderIds[0]], // For now, only one rightholder can be managed by an org
        isAdmin: isAdmin || permissionData.isAdmin
      })
    ]);
  });
}
