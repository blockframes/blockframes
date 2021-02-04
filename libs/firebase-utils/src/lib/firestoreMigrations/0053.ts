import { Firestore } from '@blockframes/firebase-utils';
import { runChunks } from '../firebase-utils';

/**
 * Update event documents to fit new specs for #4839
*/
export async function upgrade(db: Firestore) {
  const events = await db.collection('events').get();

  await runChunks(events.docs, async (eventDoc) => {
    const data = eventDoc.data();

    data.privacyType = data.isPrivate ? 'private' : 'public';

    delete data.isPrivate;

    await eventDoc.ref.set(data);
  });
}