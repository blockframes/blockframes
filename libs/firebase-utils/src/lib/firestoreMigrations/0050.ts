import { Firestore } from '@blockframes/firebase-utils';
import { runChunks } from '../firebase-utils';

/**
 * Remove data.eventId on joinOrganization invitations
 * This fix incorrect migration 0047
*/
export async function upgrade(db: Firestore) {
  const invitations = await db.collection('invitations').where('type', '==', 'joinOrganization').get();

  return runChunks(invitations.docs, async (invitationsDoc) => {
    const data = invitationsDoc.data();
    delete data.eventId;
    await invitationsDoc.ref.set(data);
  });
}