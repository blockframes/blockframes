import { Firestore } from '@blockframes/firebase-utils';
import { runChunks } from '../firebase-utils';

/**
 * Update the screener with fake ref if missing
*/
export async function upgrade(db: Firestore) {
    const invitations = await db.collection('invitations').get();

    return runChunks(invitations.docs, async (invitationsDoc) => {

        const data = invitationsDoc.data();
        data['eventId'] = data.docId;
        delete data.docId;
        await invitationsDoc.ref.set(data);
    })
}