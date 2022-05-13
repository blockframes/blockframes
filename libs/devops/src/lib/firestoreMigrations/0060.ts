import { Firestore, runChunks } from '@blockframes/firebase-utils';
import { centralOrgId } from '@env';

export async function upgrade(db: Firestore) {

  const contracts = await db.collection('contracts').get();

  /*
    Replace buyerId to fit new catalog CentralOrgId
  */
  return runChunks(contracts.docs, async (contractDoc) => {
    const contract = contractDoc.data();
    let update = false;

    if (contract.buyerId === centralOrgId.cascade8) {
      update = true;
      contract.buyerId = centralOrgId.catalog;
    }

    if (update) {
      await contractDoc.ref.set(contract);
    }
  });
}
