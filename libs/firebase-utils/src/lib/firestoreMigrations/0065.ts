import { runChunks } from '../firebase-utils';
import { Firestore } from '../types';

/**
 * Remove publicContracts collection
 * @param db 
 * @returns 
 */
export async function upgrade(db: Firestore) {
  const publicContracts = await db.collection('publicContracts').get();
  return runChunks(publicContracts.docs, async (doc) => {
    await doc.ref.delete();
  });
}