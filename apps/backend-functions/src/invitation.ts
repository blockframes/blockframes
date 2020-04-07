/**
 * Manage invitations updates.
 */
import { getDocument, getAdminIds } from './data/internals';
import { db, functions, getUserMail, getUser } from './internals/firebase';
import {
  InvitationDocument,
  InvitationOrUndefined,
  InvitationFromOrganizationToUser,
  InvitationFromUserToOrganization,
  OrganizationDocument,
  PublicUser
} from './data/types';
import { triggerNotifications, createNotification } from './notification';
import { sendMailFromTemplate } from './internals/email';
import {
  userJoinedAnOrganization,
  userJoinedYourOrganization,
  userRequestedToJoinYourOrg,
  userJoinOrgPendingRequest
} from './assets/mail-templates';

/** Checks if an invitation just got accepted. */
function wasAccepted(before: InvitationDocument, after: InvitationDocument) {
  return before.status === 'pending' && after.status === 'accepted';
}

/** Checks if an invitation just got declined. */
function wasDeclined(before: InvitationDocument, after: InvitationDocument) {
  return before.status === 'pending' && after.status === 'declined';
}

/** Checks if an invitation just got created. */
function wasCreated(before: InvitationOrUndefined, after: InvitationDocument) {
  return !before && !!after;
}

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

  return Promise.all([...adminEmailPromises]);
}

/** Updates the user, orgs, and permissions when the user accepts an invitation to an organization. */
async function onInvitationToOrgAccept({ toUser, fromOrg }: InvitationFromOrganizationToUser) {
  // TODO(issue#739): When a user is added to an org, clear other invitations
  await addUserToOrg(toUser.uid, fromOrg.id);
  // TODO maybe send an email "you have accepted to join OrgNAme ! Congratz, you are now part of this org !"
  return mailOnInvitationAccept(toUser.uid, fromOrg.id);
}

/** Send a notification to admins of organization to notify them that the user declined their invitation. */
async function onInvitationToOrgDecline(invitation: InvitationFromOrganizationToUser) {
  const orgSnapshot = await db.doc(`orgs/${invitation.fromOrg.id}`).get();
  const org = orgSnapshot.data() as OrganizationDocument;

  const userSnapshot = await db.doc(`users/${invitation.toUser.uid}`).get();
  const user = userSnapshot.data() as PublicUser;

  const adminIds = await getAdminIds(org.id);

  const notifications = adminIds.map(userId =>
    createNotification({
      userId,
      user: {
        firstName: user.firstName,
        lastName: user.lastName
      },
      app: 'blockframes',
      type: 'invitationFromOrganizationToUserDecline'
    })
  );

  return triggerNotifications(notifications);
}

/** Sends an email when an organization invites a user to join. */
async function onInvitationToOrgCreate({ toUser }: InvitationFromOrganizationToUser) {
  const userMail = await getUserMail(toUser.uid);

  if (!userMail) {
    console.error('No user email provided for userId:', toUser.uid);
    return;
  }
}

/**
 * Dispatch the invitation update call depending on whether the invitation
 * was 'created' or 'accepted'.
 */
async function onInvitationToOrgUpdate(
  before: InvitationOrUndefined,
  after: InvitationDocument,
  invitation: InvitationFromOrganizationToUser
): Promise<any> {
  if (wasCreated(before, after)) {
    return onInvitationToOrgCreate(invitation);
  } else if (wasAccepted(before!, after)) {
    return onInvitationToOrgAccept(invitation);
  } else if (wasDeclined(before!, after)) {
    return onInvitationToOrgDecline(invitation);
  }
  return;
}

/** Sends an email when an organization invites a user to join. */
async function onInvitationFromUserToJoinOrgCreate({
  toOrg,
  fromUser
}: InvitationFromUserToOrganization) {
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
}: InvitationFromUserToOrganization) {
  // TODO(issue#739): When a user is added to an org, clear other invitations
  await addUserToOrg(fromUser.uid, toOrg.id);
  await sendMailFromTemplate(userJoinedAnOrganization(fromUser.email, toOrg.id));
  return mailOnInvitationAccept(fromUser.uid, toOrg.id);
}

/** Send a notification to admins of organization to notify them that the request is declined. */
async function onInvitationFromUserToJoinOrgDecline(invitation: InvitationFromUserToOrganization) {
  const orgSnapshot = await db.doc(`orgs/${invitation.toOrg.id}`).get();
  const org = orgSnapshot.data() as OrganizationDocument;
  const adminIds = await getAdminIds(org.id);

  const notifications = adminIds.map(userId =>
    createNotification({
      userId,
      user: {
        firstName: invitation.fromUser.firstName,
        lastName: invitation.fromUser.lastName
      },
      app: 'blockframes',
      type: 'invitationFromUserToJoinOrgDecline'
    })
  );

  return triggerNotifications(notifications);
}

/**
 * Dispatch the invitation update call depending on whether the invitation
 * was 'created' or 'accepted'.
 */
async function onInvitationFromUserToJoinOrgUpdate(
  before: InvitationOrUndefined,
  after: InvitationDocument,
  invitation: InvitationFromUserToOrganization
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

/**
 * Handles firestore updates on an invitation object,
 *
 * Check the data, manage processed ids (to prevent duplicates events in functions),
 * and dispatch to the correct piece of code depending on the invitation type.
 */
export async function onInvitationWrite(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
) {
  const before = change.before;
  const after = change.after;

  if (!before || !after) {
    throw new Error('Parameter "change" not found');
  }

  const invitationDocBefore = before.data() as InvitationOrUndefined;
  const invitationDoc = after.data() as InvitationOrUndefined;

  if (!invitationDoc) {
    // Doc was deleted, ignoring...
    return;
  }

  // Prevent duplicate events with the processedId workflow
  const invitation: InvitationDocument = await getDocument<InvitationDocument>(
    `invitations/${invitationDoc.id}`
  );
  const processedId = invitation.processedId;

  if (processedId === context.eventId) {
    console.warn('Document already processed with this context');
    return;
  }

  // TODO(issue#699): redesign the processed id flow to prevent infinite loop due to
  //   the update event being triggered on every processedId change (use another table?)
  // await db.doc(`invitations/${invitation.id}`).update({ processedId: context.eventId });

  try {
    // dispatch to the correct events depending on the invitation type.
    switch (invitation.type) {
      case 'fromOrganizationToUser':
        return onInvitationToOrgUpdate(invitationDocBefore, invitationDoc, invitation);
      case 'fromUserToOrganization':
        return onInvitationFromUserToJoinOrgUpdate(invitationDocBefore, invitationDoc, invitation);
      // @TODO (#2461) case 'event'
      default:
        throw new Error(`Unhandled invitation: ${JSON.stringify(invitation)}`);
    }
  } catch (e) {
    console.error('Invitation management thrown: ', e);
    await db.doc(`invitations/${invitation.id}`).update({ processedId: null });
    throw e;
  }
}
