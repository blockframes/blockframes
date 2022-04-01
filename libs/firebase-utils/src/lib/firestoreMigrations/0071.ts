import { Timestamp, Term } from '@blockframes/shared/model';
import * as admin from 'firebase-admin';
import { runChunks } from '../firebase-utils';
import { Firestore } from '../types';

/**
 * Update time in terms duration
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const terms = await db.collection('terms').get();

  return runChunks(terms.docs, async doc => {
    const term = doc.data() as Term<Timestamp>;

    const from = term.duration.from.toDate();
    from.setHours(0, 0, 0, 0);
    term.duration.from = admin.firestore.Timestamp.fromDate(from);

    const to = term.duration.to.toDate();
    to.setHours(0, 0, 0, 0);
    term.duration.to = admin.firestore.Timestamp.fromDate(to);

    await doc.ref.set(term);
  });
}
