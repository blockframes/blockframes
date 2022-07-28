import { Firestore, removeAllSubcollections, runChunks } from '@blockframes/firebase-utils';
import { DocumentSnapshot } from 'firebase-functions/v1/firestore';

/**
 * Remove DistributionRights sub-collection from old movies
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    const subCollection = await doc.ref.listCollections();

    if (subCollection !== []) {
      const batch = db.batch();
      await removeAllSubcollections(doc, batch, db, { verbose: false });
      await batch.commit();
    }

  }).catch(err => console.error(err));
}

