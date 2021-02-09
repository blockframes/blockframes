import { Firestore } from '@blockframes/firebase-utils';
import { runChunks } from '../firebase-utils';

/**
 * Replace data.docId by data.eventId
 * @see 0050.ts for fix
*/
export async function upgrade(db: Firestore) {
  const invitations = await db.collection('invitations').get();

  return runChunks(invitations.docs, async (invitationsDoc) => {

    const data = invitationsDoc.data();
    data['eventId'] = data.docId;
    delete data.docId;
    await invitationsDoc.ref.set(data);
  });
}