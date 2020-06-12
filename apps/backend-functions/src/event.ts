import { db } from './internals/firebase';
import { EventDocument, EventMeta } from '@blockframes/event/+state/event.firestore';


/**
 * Removes invitations related to an event when event is deleted
 * @param snap 
 */
export async function onEventDelete(
  snap: FirebaseFirestore.DocumentSnapshot
) {
  const event = snap.data() as EventDocument<EventMeta>;

  const collectionRef = await db.collection('invitations').where('docId', '==', event.id).get();
  const batch = db.batch();
  for (const doc of collectionRef.docs) {
    batch.delete(doc.ref);
  }
  return batch.commit();
}

