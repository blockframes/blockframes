import { centralOrgId } from '@env';
import { Timestamp, Mandate, Movie } from '@blockframes/shared/model';
import { Firestore } from '../types';
import { runChunks } from '../firebase-utils';

/**
 * Fill Mandate Contracts with missing values
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const mandates = await db.collection('contracts').where('type', '==', 'mandate').get();
  await runChunks(mandates.docs, async doc => {
    const mandate = doc.data() as Mandate<Timestamp>;

    // clean weird legacy contract in the db (e.g: 'contracts/CDFArchipelMandate')
    const isRogueMandate = !!(mandate as any).titleIds;
    if (isRogueMandate) {
      await doc.ref.delete();
      return;
    }

    let update = false;

    if (!mandate.sellerId) {
      update = true;
      mandate.sellerId = centralOrgId.catalog;
    }

    if (!mandate.stakeholders?.length) {
      update = true;
      const movieSnap = await db.collection('movies').doc(mandate.titleId).get();
      const movie = movieSnap.data() as Movie;
      const sellerId = movie.orgIds[0];
      mandate.stakeholders = [sellerId, centralOrgId.catalog];
    }

    if (update) {
      await doc.ref.set(mandate);
    }
  });
}
