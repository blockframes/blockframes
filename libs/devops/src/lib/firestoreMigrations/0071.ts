import { Term } from '@blockframes/model';
import { Firestore, runChunks, toDate } from '@blockframes/firebase-utils';

/**
 * Update time in terms duration
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const terms = await db.collection('terms').get();

  return runChunks(terms.docs, async (doc) => {
    const term = toDate<Term>(doc.data());

    const from = term.duration.from;
    from.setHours(0, 0, 0, 0);
    term.duration.from = from;

    const to = term.duration.to;
    to.setHours(0, 0, 0, 0);
    term.duration.to = to;

    await doc.ref.set(term);
  });
}
