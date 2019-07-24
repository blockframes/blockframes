/**
 * Manage invitations updates.
 */
import { createOrganizationDocPermissions, createUserDocPermissions, getDocument } from './data/internals';
import { db, functions } from './internals/firebase';
import { Delivery, Invitation, Organization } from './data/types';
import { prepareNotification, triggerNotifications } from './notify';
import { sendMail } from './internals/email';
import { auth } from 'firebase-admin';
import { userInviteToOrg } from './assets/mailTemplates';

type InvitationOrUndefined = Invitation | undefined;

/**
 * @param before
 * @param after
 * @returns whether the invitation just got accepted.
 */
function wasAccepted(before: Invitation, after: Invitation) {
  return before.state === 'pending' && after.state === 'accepted';
}

/**
 * @param before
 * @param after
 * @returns whether the invitation just got created
 */
function wasCreated(before: InvitationOrUndefined, after: Invitation) {
  return !before && !!after;
}

async function onOrgInvitationAccept(invitation: Invitation) {
  const { userId, organizationId } = invitation;

  if (!organizationId) {
    console.error('No orgId defined in the invitation', invitation);
    return;
  }

  const userRef = db.collection('users').doc(userId);
  const organizationRef = db.collection('orgs').doc(organizationId);
  const permissionsRef = db.collection('permissions').doc(organizationId);
  const invitationRef = db.collection('invitations').doc(invitation.id);

  return db.runTransaction(async tx => {
    const [user, org, perm] = await Promise.all([
      tx.get(userRef),
      tx.get(organizationRef),
      tx.get(permissionsRef)
    ]);

    const userData = user.data();
    const orgData = org.data();
    const permData = perm.data();

    if (!userData || !orgData || !permData) {
      console.error(
        'Something went wrong with the invitation, a required document is not set\n',
        userData,
        orgData,
        permData
      );
      return;
    }

    return Promise.all([
      // Update user's orgId
      tx.set(userRef, { ...user, orgId: invitation.organizationId }),
      // Update organization
      tx.set(organizationRef, { ...orgData, userIds: [...orgData.userIds, userId] }),
      // Update Permissions
      tx.set(permissionsRef, { ...permData, admins: [...permData.admins, invitation.userId] }),
      // Remove the invitation
      tx.delete(invitationRef)
    ]);
  });
}

async function getUserMail(userId: string): Promise<string | undefined> {
  const user = await auth().getUser(userId);
  return user.email;
}

async function onOrgInvitationCreate(invitation: Invitation) {
  const p1 = triggerNotifications([
    // TODO: fix this notification
    prepareNotification({
      userId: invitation.userId,
      message: `You have been invited to an organization!\n
          Click on the link below to go to the invitation!`,
      docInformations: { id: '12', type: 'movie' },
      path: ''
    })
  ]);
  // TODO: define content
  const userMail = await getUserMail(invitation.userId);

  let p2;

  if (!userMail) {
    console.error('No user email provided for userId:', invitation.userId);
  } else {
    p2 = sendMail(userInviteToOrg(userMail));
  }

  return Promise.all([p1, p2]);
}

async function onStakeholderInvitationAccept(invitation: Invitation): Promise<any> {
  // If the stakeholder accept the invitation, we create all permissions and notifications
  // we need to get the new users on the documents with their own (and limited) permissions.

  // Create all the constants we need to work with
  const documentId = invitation.docInformations.id;
  const stakeholderId = invitation.organizationId;
  const delivery = await getDocument<Delivery>(`deliveries/${documentId}`);

  const [
    organizationDocPermissionsSnap,
    userDocPermissionsSnap,
    stakeholderSnap,
    organizationSnap,
    organizationMoviePermissionsSnap,
    userMoviePermissionsSnap,
    organization
  ] = await Promise.all([
    db.doc(`permissions/${stakeholderId}/orgDocsPermissions/${documentId}`).get(),
    db.doc(`permissions/${stakeholderId}/userDocsPermissions/${documentId}`).get(),
    db.doc(`deliveries/${documentId}/stakeholders/${stakeholderId}`).get(),
    db.doc(`orgs/${stakeholderId}`).get(),
    db.doc(`permissions/${stakeholderId}/orgDocsPermissions/${delivery.movieId}`).get(),
    db.doc(`permissions/${stakeholderId}/userDocsPermissions/${delivery.movieId}`).get(),
    getDocument<Organization>(`orgs/${stakeholderId}`)
  ]);

  const orgDocPermissions = createOrganizationDocPermissions({
    id: documentId,
    canUpdate: true
  });
  const userDocPermissions = createUserDocPermissions({ id: documentId });
  const orgMoviePermissions = createOrganizationDocPermissions({ id: delivery.movieId });
  const userMoviePermissions = createUserDocPermissions({ id: delivery.movieId });

  return db.runTransaction(tx => {
    return Promise.all([
      // Initialize organization permissions on a document owned by another organization
      tx.set(organizationDocPermissionsSnap.ref, orgDocPermissions),

      // Then Initialize user permissions document
      tx.set(userDocPermissionsSnap.ref, userDocPermissions),

      // Make the new stakeholder active on the delivery by switch isAccepted property from false to true
      tx.update(stakeholderSnap.ref, { isAccepted: true }),

      // Push the delivery's movie into stakeholder Organization's movieIds so users have access to the new doc
      tx.update(organizationSnap.ref, {
        movieIds: [...organization.movieIds, delivery.movieId]
      }),

      // Finally, also initialize reading rights on the movie for the invited organization
      tx.set(organizationMoviePermissionsSnap.ref, orgMoviePermissions),
      tx.set(userMoviePermissionsSnap.ref, userMoviePermissions),

      // Now that permissions are in the database, notify organization users with direct link to the document
      triggerNotifications(
        organization.userIds.map(userId => {
          return prepareNotification({
            message:
              `You can now work on ${invitation.docInformations.type} ${
                invitation.docInformations.id
              }.\n` + `Click on the link below to go to the ${invitation.docInformations.type}`,
            userId,
            docInformations: invitation.docInformations,
            path: invitation.path
          });
        })
      )
    ]);
  });
}

async function onOrgInvitationUpdate(
  before: InvitationOrUndefined,
  after: Invitation,
  invitation: Invitation
): Promise<any> {
  if (wasCreated(before, after)) {
    return onOrgInvitationCreate(invitation);
  } else if (wasAccepted(before!, after)) {
    return onOrgInvitationAccept(invitation);
  }
  return;
}

async function onStakeholderInvitationUpdate(
  before: InvitationOrUndefined,
  after: Invitation,
  invitation: Invitation
): Promise<any> {
  if (!before) {
    return;
  }

  if (wasAccepted(before, after)) {
    return onStakeholderInvitationAccept(invitation);
  }
  return;
}

export async function onInvitationUpdate(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
) {
  const before = change.before;
  const after = change.after;

  if (!before || !after) {
    throw new Error(`Parameter 'change' not found`);
  }

  const invitationDocBefore = before.data() as InvitationOrUndefined;
  const invitationDoc = after.data() as InvitationOrUndefined;

  if (!invitationDoc) {
    // Doc was deleted, ignoring...
    return;
  }

  // Prevent duplicate events with the processedId workflow
  const invitation: Invitation = await getDocument<Invitation>(`invitations/${invitationDoc.id}`);
  const processedId = invitation.processedId;

  if (processedId === context.eventId) {
    console.warn('Document already processed with this context');
    return;
  }
  await db.doc(`invitations/${invitation.id}`).update({ processedId: context.eventId });

  try {
    switch (invitationDoc.type) {
      case undefined: // TODO: define type in the app.
        return await onStakeholderInvitationUpdate(invitationDocBefore, invitationDoc, invitation);
      case 'orgInvitation':
        return await onOrgInvitationUpdate(invitationDocBefore, invitationDoc, invitation);
      default:
        throw new Error(`Unhandled invitation type: ${invitation.type}`);
    }
  } catch (e) {
    console.error('invitation management thrown:', e);
    await db.doc(`invitations/${invitation.id}`).update({ processedId: null });
    throw e;
  }
}
