
import { db, getUserMail, getUser } from './../firebase';
import {
  InvitationDocument,
  InvitationOrUndefined,
  OrganizationDocument,
  PublicUser
} from './../../data/types';
import { triggerNotifications, createNotification } from './../../notification';
import { sendMailFromTemplate } from './../email';
import {
  userJoinedAnOrganization,
  userJoinedYourOrganization,
  userRequestedToJoinYourOrg,
  userJoinOrgPendingRequest
} from '../../templates/mail';
import { getAdminIds, getDocument } from '../../data/internals';
import { wasAccepted, wasDeclined, wasCreated } from './utils';

async function addUserToOrg(userId: string, organizationId: string) {
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
        userIds: [...organizationData.userIds, userId]
      }),
      // Update Permissions
      tx.set(permissionsRef, { ...permissionData, roles: permissionData.roles })
    ]);
  });
}

async function mailOnInvitationAccept(userId: string, organizationId: string) {
  const userEmail = await getUserMail(userId);
  const adminIds = await getAdminIds(organizationId);
  const adminEmails = await Promise.all(adminIds.map(getUserMail));

  const adminEmailPromises = adminEmails
    .filter(mail => !!mail)
    .map(adminEmail => sendMailFromTemplate(userJoinedYourOrganization(adminEmail!, userEmail!)));

  return Promise.all(adminEmailPromises);
}


/** Sends an email when an organization invites an user to join. */
async function onInvitationToOrgCreate({ toUser }: InvitationDocument) {
  if(!toUser){
    console.error('No user provided');
    return;
  }

  const userMail = await getUserMail(toUser.uid);
  if (!userMail) {
    console.error('No user email provided for userId:', toUser.uid);
    return;
  }

  // @TODO (#2539) Not implemented @see userInviteToOrg template
}

/** Updates the user, orgs, and permissions when the user accepts an invitation to an organization. */
async function onInvitationToOrgAccept({ toUser, fromOrg }: InvitationDocument) {
  if(!toUser || !fromOrg){
    console.error('No user or org provided');
    return;
  }

  // TODO(issue#739): When a user is added to an org, clear other invitations
  await addUserToOrg(toUser.uid, fromOrg.id);
  // TODO maybe send an email "you have accepted to join OrgNAme ! Congratz, you are now part of this org !"
  return mailOnInvitationAccept(toUser.uid, fromOrg.id);
}

/** Send a notification to admins of organization to notify them that the user declined their invitation. */
async function onInvitationToOrgDecline(invitation: InvitationDocument) {
  if(!invitation.toUser || !invitation.fromOrg){
    console.error('No user or org provided');
    return;
  }
  const org = await getDocument<OrganizationDocument>(`orgs/${invitation.fromOrg.id}`);
  const user = await getDocument<PublicUser>(`users/${invitation.toUser.uid}`);
  const adminIds = await getAdminIds(org.id);

  const notifications = adminIds.map(toUserId =>
    createNotification({
      toUserId,
      user: {
        firstName: user.firstName,
        lastName: user.lastName
      },
      type: 'invitationFromOrganizationToUserDecline'
    })
  );

  return triggerNotifications(notifications);
}

/** Sends an email when an organization invites a user to join. */
async function onInvitationFromUserToJoinOrgCreate({
  toOrg,
  fromUser
}: InvitationDocument) {
  if(!fromUser || !toOrg){
    console.error('No user or org provided');
    return;
  }

  const userData = await getUser(fromUser.uid);

  if (!userData.email) {
    throw new Error(`no email for userId: ${fromUser.uid}`);
  }

  const adminIds = await getAdminIds(toOrg.id);

  const admins = await Promise.all(adminIds.map(getUser));
  // const validSuperAdminMails = superAdminsMails.filter(adminEmail => !!adminEmail);

  // send invitation pending email to user
  await sendMailFromTemplate(
    userJoinOrgPendingRequest(userData.email, toOrg.denomination.full, userData.firstName!)
  );

  // send invitation received to every org admin
  return Promise.all(
    admins.map(admin =>
      sendMailFromTemplate(
        userRequestedToJoinYourOrg({
          adminEmail: admin.email,
          adminName: admin.firstName!,
          organizationName: toOrg.denomination.full,
          organizationId: toOrg.id,
          userFirstname: userData.firstName!,
          userLastname: userData.lastName!
        })
      )
    )
  );
}

/** Send a mail and update the user, org and permission when the user was accepted. */
async function onInvitationFromUserToJoinOrgAccept({
  toOrg,
  fromUser
}: InvitationDocument) {
  if(!fromUser || !toOrg){
    console.error('No user or org provided');
    return;
  }
  
  // TODO(issue#739): When a user is added to an org, clear other invitations
  await addUserToOrg(fromUser.uid, toOrg.id);
  await sendMailFromTemplate(userJoinedAnOrganization(fromUser.email, toOrg.id));
  return mailOnInvitationAccept(fromUser.uid, toOrg.id);
}

/** Send a notification to admins of organization to notify them that the request is declined. */
async function onInvitationFromUserToJoinOrgDecline(invitation: InvitationDocument) {
  if(!invitation.fromUser || !invitation.toOrg){
    console.error('No user or org provided');
    return;
  }

  const org = await getDocument<OrganizationDocument>(`orgs/${invitation.toOrg.id}`);
  const adminIds = await getAdminIds(org.id);

  const notifications = adminIds.map(toUserId =>
    createNotification({
      toUserId,
      user: {
        firstName: invitation.fromUser?.firstName,
        lastName: invitation.fromUser?.lastName
      },
      type: 'invitationFromUserToJoinOrgDecline'
    })
  );

  return triggerNotifications(notifications);
}


/**
* Dispatch the invitation update call depending on whether the invitation
* was 'created' or 'accepted'.
*/
export async function onInvitationToOrgUpdate(
  before: InvitationOrUndefined,
  after: InvitationDocument,
  invitation: InvitationDocument
): Promise<any> {
  if (wasCreated(before, after)) {
    return onInvitationToOrgCreate(invitation);
  } else if (wasAccepted(before!, after)) {
    return onInvitationToOrgAccept(invitation);
  } else if (wasDeclined(before!, after)) {
    return onInvitationToOrgDecline(invitation);
  }
}


/**
* Dispatch the invitation update call depending on whether the invitation
* was 'created' or 'accepted'.
*/
export async function onInvitationFromUserToJoinOrgUpdate(
  before: InvitationOrUndefined,
  after: InvitationDocument,
  invitation: InvitationDocument
): Promise<any> {
  if (wasCreated(before, after)) {
    return onInvitationFromUserToJoinOrgCreate(invitation);
  } else if (wasAccepted(before!, after)) {
    return onInvitationFromUserToJoinOrgAccept(invitation);
  } else if (wasDeclined(before!, after)) {
    return onInvitationFromUserToJoinOrgDecline(invitation);
  }
  return;
}