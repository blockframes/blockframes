
import { Firestore, runChunks } from '@blockframes/firebase-utils';
import { Contract } from '@blockframes/model';

/**
 * add offerId when missing on contracts
 * @returns
 */
export async function upgrade(db: Firestore) {
  const contracts = await db.collection('contracts').get();

  return runChunks(contracts.docs, async (doc) => {
    const contract = doc.data() as Contract;

    if (!contract.offerId) {
      contract.offerId = '';
      await doc.ref.set(contract);
    }
  });
}
