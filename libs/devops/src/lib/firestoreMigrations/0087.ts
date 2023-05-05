
import { Firestore, runChunks } from '@blockframes/firebase-utils';
import { isInKeys, Term } from '@blockframes/model';

/**
 * Fix old terms medias & territories
 * @returns
 */
export async function upgrade(db: Firestore) {
  const terms = await db.collection('terms').get();

  return runChunks(terms.docs, async (doc) => {
    const term = doc.data() as Term;

    term.territories = term.territories.filter(t => isInKeys('territories', t));
    term.medias = term.medias.filter(m => isInKeys('medias', m));

    await doc.ref.set(term);
  });
}
