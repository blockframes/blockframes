import { Firestore } from '@blockframes/firebase-utils';
import { runChunks } from '../firebase-utils';

/**
 * Update event documents to fit new specs for #4839 & #4046
*/
export async function upgrade(db: Firestore) {
  const events = await db.collection('events').get();

  await runChunks(events.docs, async (eventDoc) => {
    const data = eventDoc.data();

    data.isSecret = false;

    if (data.ownerId) {
      data.ownerOrgId = data.ownerId;
      delete data.ownerId;
    }

    if (data.meta?.organizerId) {
      data.meta.organizerUid = data.meta.organizerId;
      delete data.meta.organizerId;
    }

    // Cleaning fields that should not be here CF formatToFirestore in event.service
    if (data.movie) delete data.movie;
    if (data.organizedBy) delete data.organizedBy;
    if (data.org) delete data.org;

    await eventDoc.ref.set(data);
  });
}