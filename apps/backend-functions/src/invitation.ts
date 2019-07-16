import { db, functions } from './firebase';
import {
  getDocument,
  initializeOrgDocPermissions,
  initializeUserDocPermissions
} from './data/internals';
import { Invitation, Organization, Delivery } from './data/types';
import { prepareNotification, triggerNotifications } from './notify';

export async function onInvitationUpdate(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
) {
  if (!change.after || !change.before) {
    throw new Error(`Parameter 'change' not found`);
  }

  const invitationDoc = change.after.data();
  const invitationDocBefore = change.before.data();

  if (!invitationDoc || !invitationDocBefore) {
    throw new Error(`No changes detected on this document`);
  }

  const invitation = await getDocument<Invitation>(`invitations/${invitationDoc.id}`);
  const processedId = invitation.processedId;

  if (processedId === context.eventId) {
    throw new Error(`Document already processed with this context`);
  }

  // If the stakeholder accept the invitation, we create all permissions and notifications
  // we need to get the new users on the documents with their own (and limited) permissions.
  if (invitationDocBefore.state === 'pending' && invitationDoc.state === 'accepted') {
    try {
      // Create all the constants we need to work with
      const documentId = invitation.docID.id;
      const stakeholderId = invitation.stakeholderId;

      const orgDocPermissions = initializeOrgDocPermissions(documentId, { canUpdate: true });
      const orgDocPermissionsSnap = await db
        .doc(`permissions/${stakeholderId}/orgDocsPermissions/${documentId}`)
        .get();

      const userDocPermissions = initializeUserDocPermissions(documentId);
      const userDocPermissionsSnap = await db
        .doc(`permissions/${stakeholderId}/userDocsPermissions/${documentId}`)
        .get();
      const stakeholderSnap = await db
        .doc(`deliveries/${documentId}/stakeholders/${stakeholderId}`)
        .get();

      const stakeholderOrg = await getDocument<Organization>(`orgs/${stakeholderId}`);
      const stakeholderOrgSnap = await db.doc(`orgs/${stakeholderId}`).get();

      const delivery = await getDocument<Delivery>(`deliveries/${documentId}`);
      const orgMoviePermissions = initializeOrgDocPermissions(delivery.movieId);
      const orgMoviePermissionsSnap = await db
        .doc(`permissions/${stakeholderId}/orgDocsPermissions/${delivery.movieId}`)
        .get();
      const userMoviePermissions = initializeUserDocPermissions(delivery.movieId);
      const userMoviePermissionsSnap = await db
        .doc(`permissions/${stakeholderId}/userDocsPermissions/${delivery.movieId}`)
        .get();

      db.runTransaction(async (tx: FirebaseFirestore.Transaction) => {
        // Initialize organization permissions on a document owned by another organization
        tx.set(orgDocPermissionsSnap.ref, orgDocPermissions);

        // Then Initialize user permissions document
        tx.set(userDocPermissionsSnap.ref, userDocPermissions);

        // Make the new stakeholder active on the delivery by switch isAccepted property from false to true
        tx.update(stakeholderSnap.ref, { isAccepted: true });

        // Push the delivery's movie into stakeholder Organization's movieIds so users have access to the new doc
        const movieIds = [...stakeholderOrg.movieIds, delivery.movieId];
        tx.update(stakeholderOrgSnap.ref, { movieIds });

        // Finally, also initialize reading rights on the movie for the invited organization
        tx.set(orgMoviePermissionsSnap.ref, orgMoviePermissions);
        tx.set(userMoviePermissionsSnap.ref, userMoviePermissions);

        // Now that permissions are in the database, notify organization users with direct link to the document
        const notifications = stakeholderOrg.userIds.map(userId => {
          return prepareNotification({
            message: `You can now work on ${invitation.docID.type} ${invitation.docID.id}.
            Click on the link below to go to the ${invitation.docID.type}`,
            userId,
            docID: invitation.docID,
            path: invitation.path
          });
        });
        await triggerNotifications(notifications);
      });

      return true;
    } catch (error) {
      await db.doc(`invitations/${invitation.id}`).update({ processedId: null });
      throw error;
    }
  }
  return true;
}
