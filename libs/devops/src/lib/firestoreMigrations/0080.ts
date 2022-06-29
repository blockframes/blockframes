import { Firestore, runChunks } from '@blockframes/firebase-utils';
import { Invitation } from '@blockframes/model';

/**
 * Update invitation documents
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const invitations = await db.collection('invitations').get();

  return runChunks(invitations.docs, async (doc) => {
    const invitation = doc.data() as Invitation;

    if ((invitation as any).watchTime) {
      invitation.watchInfos = {
        duration: (invitation as any).watchTime,
        date: null
      };
      delete (invitation as any).watchTime;
    }

    // Update invitation in DB
    await doc.ref.set(invitation);
  }).catch(err => console.error(err));
}
