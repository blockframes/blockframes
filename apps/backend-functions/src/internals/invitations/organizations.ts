import * as admin from 'firebase-admin';
import { getUser } from "./../utils";
import { triggerNotifications, createNotification } from './../../notification';
import { sendMailFromTemplate } from './../email';
import { userJoinedAnOrganization } from '../../templates/mail';
import { getAdminIds, getDocument, getOrgAppKey, createPublicOrganizationDocument, createPublicUserDocument, createDocumentMeta } from '../../data/internals';
import { wasAccepted, wasDeclined, wasCreated } from './utils';
import { applicationUrl } from '@blockframes/utils/apps';
import { getOrgEmailData, getUserEmailData } from '@blockframes/utils/emails/utils';
import { groupIds } from '@blockframes/utils/emails/ids';
import { InvitationDocument, InvitationOrUndefined, OrganizationDocument } from '@blockframes/model';

async function addUserToOrg(userId: string, organizationId: string) {
  const db = admin.firestore();
  if (!organizationId || !userId) {
    throw new Error(`missing data: userId=${userId}, organizationId=${organizationId}`);
  }

  console.debug('add user:', userId, 'to org:', organizationId);

  const userRef = db.collection('users').doc(userId);
  const organizationRef = db.collection('orgs').doc(organizationId);
  const permissionsRef = db.collection('permissions').doc(organizationId);

  return db.runTransaction(async tx => {
    const [user, organization, permission] = await Promise.all([
      tx.get(userRef),
      tx.get(organizationRef),
      tx.get(permissionsRef)
    ]);

    const userData = user.data();
    const organizationData = organization.data();
    const permissionData = permission.data();

    if (!userData || !organizationData || !permissionData) {
      console.error(
        'Something went wrong with the invitation, a required document is not set',
        userData,
        organizationData,
        permissionData
      );
      return;
    }

    // Add the new user and his role to the permissions object.
    permissionData.roles[userId] = 'member';

    return Promise.all([
      // Update user's orgId
      tx.set(userRef, { ...userData, orgId: organizationId }),
      // Update organization
      tx.set(organizationRef, {
        ...organizationData,
        userIds: Array.from(new Set([...organizationData.userIds, userId]))
      }),
      // Update Permissions
      tx.set(permissionsRef, { ...permissionData, roles: permissionData.roles })
    ]);
  });
}

/** Updates the user, orgs, and permissions when the user accepts an invitation to an organization. */
async function onInvitationToOrgAccept({ toUser, fromOrg }: InvitationDocument) {
  if (!toUser || !fromOrg) {
    console.error('No user or org provided');
    return;
  }

  return addUserToOrg(toUser.uid, fromOrg.id);
}

/** Send a notification to admins of organization to notify them that the invitation is declined. */
async function onInvitationToOrgDecline(invitation: InvitationDocument) {
  if (!invitation.fromUser || !invitation.toOrg) {
    console.error('No user or org provided');
    return;
  }

  const org = await getDocument<OrganizationDocument>(`orgs/${invitation.toOrg.id}`);
  const adminIds = await getAdminIds(org.id);
  const appAccess = await getOrgAppKey(org);

  const notifications = adminIds.map(toAdminId =>
    createNotification({
      toUserId: toAdminId,
      user: createPublicUserDocument(invitation.toUser),
      type: 'invitationToJoinOrgDeclined',
      _meta: createDocumentMeta({ createdFrom: appAccess })
    })
  );

  return triggerNotifications(notifications);
}

/** create a notification/email to sender and org member(s) when
 * a request from user to join org is created. */
async function onRequestFromUserToJoinOrgCreate({
  toOrg,
  fromUser
}: InvitationDocument) {
  if (!fromUser || !toOrg) {
    console.error('No user or org provided');
    return;
  }

  const userData = await getUser(fromUser.uid);

  if (!userData.email) {
    throw new Error(`no email for userId: ${fromUser.uid}`);
  }

  const org = await getDocument<OrganizationDocument>(`orgs/${toOrg.id}`);
  const adminIds = await getAdminIds(org.id);
  const fromApp = userData._meta.createdFrom;

  // create notifications to org admin/superAdmin letting them know that an user is waiting for approval
  const notifications = adminIds.map(toUserId =>
    createNotification({
      toUserId,
      user: createPublicUserDocument(userData),
      organization: createPublicOrganizationDocument(org),
      type: 'requestFromUserToJoinOrgCreate',
      _meta: createDocumentMeta({ createdFrom: fromApp })
    })
  );

  // create a notification to user who want to join org letting him know that his request was sent and is beeing processed
  notifications.push(
    createNotification({
      toUserId: userData.uid,
      user: createPublicUserDocument(userData),
      organization: createPublicOrganizationDocument(org),
      type: 'requestFromUserToJoinOrgPending',
      _meta: createDocumentMeta({ createdFrom: fromApp })
    }))

  return triggerNotifications(notifications);
}

/** Send a mail and update the user, org and permission when the user was accepted. */
async function onRequestFromUserToJoinOrgAccept({
  toOrg,
  fromUser
}: InvitationDocument) {
  if (!fromUser || !toOrg) {
    console.error('No user or org provided');
    return;
  }
  await addUserToOrg(fromUser.uid, toOrg.id);
  const app = await getOrgAppKey(toOrg.id);
  const urlToUse = applicationUrl[app];
  const org = getOrgEmailData(toOrg);
  const toUser = getUserEmailData(fromUser);
  const template = userJoinedAnOrganization(toUser, urlToUse, org);
  return sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** Send a notification to admins of organization to notify them that the request is declined. */
async function onRequestFromUserToJoinOrgDecline(invitation: InvitationDocument) {
  if (!invitation.fromUser || !invitation.toOrg) {
    console.error('No user or org provided');
    return;
  }

  const org = await getDocument<OrganizationDocument>(`orgs/${invitation.toOrg.id}`);
  const adminIds = await getAdminIds(org.id);

  const notifications = adminIds.map(toUserId =>
    createNotification({
      toUserId,
      user: createPublicUserDocument(invitation.fromUser),
      type: 'requestFromUserToJoinOrgDeclined',
      _meta: createDocumentMeta({ createdFrom: invitation.fromUser._meta.createdFrom })
    })
  );

  return triggerNotifications(notifications);
}


/**
* Dispatch the invitation update call depending on whether the invitation
* was 'created' or 'accepted'.
*/
export async function onInvitationToJoinOrgUpdate(
  before: InvitationOrUndefined,
  after: InvitationDocument,
  invitation: InvitationDocument
) {
  if (wasAccepted(before, after)) {
    return onInvitationToOrgAccept(invitation);
  } else if (wasDeclined(before, after)) {
    return onInvitationToOrgDecline(invitation);
  }
}


/**
* Dispatch the invitation update call depending on whether the invitation
* was 'created' or 'accepted'.
*/
export async function onRequestToJoinOrgUpdate(
  before: InvitationOrUndefined,
  after: InvitationDocument,
  invitation: InvitationDocument
) {
  if (wasCreated(before, after)) {
    return onRequestFromUserToJoinOrgCreate(invitation);
  } else if (wasAccepted(before, after)) {
    return onRequestFromUserToJoinOrgAccept(invitation);
  } else if (wasDeclined(before, after)) {
    return onRequestFromUserToJoinOrgDecline(invitation);
  }
  return;
}
