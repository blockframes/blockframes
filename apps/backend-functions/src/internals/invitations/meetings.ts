import * as admin from 'firebase-admin';

/**
 * Return true if userId has accepted invitation for eventId
 * @param userId : string - Id of user
 * @param eventId : string - Id of doc (id of event in Invitation)
 */
export async function hasUserAcceptedEvent(userId: string, eventId: string) {
  const db = admin.firestore();
  const accepted = db.collection('invitations')
    .where('type', '==', 'attendEvent')
    .where('docId', '==', eventId)
    .where('status', '==', 'accepted');
  const acceptedInvitations = accepted.where('toUser.uid', '==', userId).where('mode', '==', 'invitation');
  const acceptedRequests = accepted.where('fromUser.uid', '==', userId).where('mode', '==', 'request');

  const [invitations, requests] = await Promise.all([
    acceptedInvitations.get(),
    acceptedRequests.get()
  ]);

  return !(invitations.size === 0 && requests.size === 0);
}