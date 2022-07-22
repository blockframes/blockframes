import { Firestore, runChunks } from '@blockframes/firebase-utils';
import { Analytics } from '@blockframes/model';

/**
 * Update analytics documents
 */
export async function upgrade(db: Firestore) {
  const analytics = await db.collection('analytics').get();

  return runChunks(analytics.docs, async (doc) => {
    const analytic = doc.data() as Analytics;

    if ((analytic as any).name === 'promoReelOpened') {
      analytic.name = 'promoElementOpened';
      await doc.ref.set(analytic);
    }

  }).catch(err => console.error(err));
}
