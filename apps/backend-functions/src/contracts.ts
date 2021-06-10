import { db } from './internals/firebase';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';

export async function onContractDelete(contractSnapshot: FirebaseFirestore.DocumentSnapshot<Contract>) {

  const contract = contractSnapshot.data() as Contract;

  // Delete terms belonging to contract
  const termsCollectionRef = db.collection('terms').where('contractId', '==', contract.id);
  const termsSnap = await termsCollectionRef.get();
  for (const term of termsSnap.docs) {
    await term.ref.delete();
  }

  // Delete offers belonging to contract, if any
  if (contract.offerId) {
    await db.doc(`offers/${contract.offerId}`).delete();
  }

  // Delete incomes documents, if any
  const incomesCollectionRef = db.collection('incomes').where('contractId', '==', contract.id);
  const incomesSnap = await incomesCollectionRef.get();
  for (const income of incomesSnap.docs) {
    await income.ref.delete();
  }

  console.log(`Contract ${contract.id} removed`);
}
