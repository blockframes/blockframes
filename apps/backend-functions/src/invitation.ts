import { db, functions } from './firebase';
import { createOrganizationDocPermissions, createUserDocPermissions, getDocument } from './data/internals';
import { Delivery, Invitation, Organization } from './data/types';
import { prepareNotification, triggerNotifications } from './notify';

async function onOrgInvitationAccepted(invitation: Invitation) {
  const userRef = db.collection('users').doc(invitation.userId);
  const invitationRef = db.collection('invitations').doc(invitation.id);

  return db.runTransaction(async tx => {
    const user = await tx.get(userRef);

    return Promise.all([
      tx.set(userRef, {...user, orgId: invitation.orgId}),
      tx.delete(invitationRef),
      ]
    )
  })
}

async function onStakeholderInvitationAccepted(invitation: Invitation) {
  // If the stakeholder accept the invitation, we create all permissions and notifications
  // we need to get the new users on the documents with their own (and limited) permissions.
  try {
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

    await db.runTransaction(tx => {
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
    return true;
  } catch (error) {
    await db.doc(`invitations/${invitation.id}`).update({ processedId: null });
    throw error;
  }
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

  const invitationDocBefore = before.data();
  const invitationDoc = after.data();

  if (!invitationDoc || !invitationDocBefore) {
    console.info('No changes detected on this document');
    return;
  }

  const invitation: Invitation = await getDocument<Invitation>(`invitations/${invitationDoc.id}`);
  const processedId = invitation.processedId;

  if (processedId === context.eventId) {
    console.warn('Document already processed with this context');
    return;
  }

  // We only care about switches from 'pending' to 'accepted' for now
  if (!(invitationDocBefore.state === 'pending' && invitationDoc.state === 'accepted')) {
    return;
  }

  switch (invitationDoc.type) {
    case undefined:
      return onStakeholderInvitationAccepted(invitation);
    case 'orgInvitation':
      return onOrgInvitationAccepted(invitation);
    default:
      throw new Error(`Unhandled invitation type: ${invitation.type}`);
  }
}
