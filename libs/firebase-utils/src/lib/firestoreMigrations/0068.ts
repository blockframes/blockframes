
import * as env from '@env';
import { Firestore } from '../types';
import { runChunks } from '../firebase-utils';

export const { storageBucket } = env.firebase();

/**
 * Update all events with the right accessibility property (instead of isPrivate property)
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {

  const events = await db.collection('events').get();
  return runChunks( 
    events.docs,
    async (doc) => {
      const event = doc.data();
      if (!event.accessibility) {
        event.accessibility = event.isPrivate ? 'private' : 'public';
        delete event.isPrivate;
        await doc.ref.set(event);
      }
    },
  ).catch(err => console.error(err));

}
