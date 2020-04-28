import { getDocument } from './data/internals';
import { db, functions } from './internals/firebase';
import { InvitationDocument, InvitationOrUndefined } from './data/types';
import { onInvitationToOrgUpdate, onInvitationFromUserToJoinOrgUpdate } from './internals/invitations/organizations';
import { onInvitationToAnEventUpdate } from './internals/invitations/events';


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

  // Doc was deleted, ignoring...
  if (!invitationDoc) { return; }

  // Prevent duplicate events with the processedId workflow
  const invitation: InvitationDocument = await getDocument<InvitationDocument>(
    `invitations/${after.id}`
  );
  const processedId = invitation.processedId;

  if (processedId === context.eventId) {
    console.warn('Document already processed with this context');
    return;
  }

  try {
    // dispatch to the correct events depending on the invitation type.
    switch (invitation.type) {
      case 'fromOrganizationToUser':
        return onInvitationToOrgUpdate(invitationDocBefore, invitationDoc, invitation);
      case 'fromUserToOrganization':
        return onInvitationFromUserToJoinOrgUpdate(invitationDocBefore, invitationDoc, invitation);
      case 'event':
        /**
         * @dev In this case, an invitation to an event can be:
         * a request from an user who wants to attend an event.
         * an invitation to an user that can be interested to attend an event.
         */
        return onInvitationToAnEventUpdate(invitationDocBefore, invitationDoc, { ...invitation, id: before.id });
      default:
        throw new Error(`Unhandled invitation: ${JSON.stringify(invitation)}`);
    }
  } catch (e) {
    console.error('Invitation management thrown: ', e);
    await db.doc(`invitations/${invitation.id}`).update({ processedId: null });
    throw e;
  }
}
