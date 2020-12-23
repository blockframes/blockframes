import { db } from './internals/firebase';
import { EventDocument, EventMeta } from '@blockframes/event/+state/event.firestore';


/**
 * Removes invitations and notifications related to an event when event is deleted
 * @param snap 
 */
export async function onEventDelete(
  snap: FirebaseFirestore.DocumentSnapshot
) {
  const event = snap.data() as EventDocument<EventMeta>;
  const batch = db.batch();

  const invitsCollectionRef = await db.collection('invitations').where('eventId', '==', event.id).get();
  for (const doc of invitsCollectionRef.docs) {
    batch.delete(doc.ref);
  }

  const notifsCollectionRef = await db.collection('notifications').where('docId', '==', event.id).get();
  for (const doc of notifsCollectionRef.docs) {
    batch.delete(doc.ref);
  }
  return batch.commit();
}
