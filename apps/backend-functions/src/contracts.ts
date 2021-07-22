import { db } from './internals/firebase';
import { Contract, ContractStatus, Mandate, Sale } from '@blockframes/contract/contract/+state/contract.model';
import { Change } from 'firebase-functions';
import { Offer } from '@blockframes/contract/offer/+state';

export async function onContractDelete(contractSnapshot: FirebaseFirestore.DocumentSnapshot<Contract>) {

  const contract = contractSnapshot.data() as Contract;

  // Delete terms belonging to contract
  const termsCollectionRef = db.collection('terms').where('contractId', '==', contract.id);
  const termsSnap = await termsCollectionRef.get();
  for (const term of termsSnap.docs) {
    await term.ref.delete();
  }

  // An offer can have multiple contracts
  // We don't want to delete the offer if it still have other contracts
  // We want to delete the offer only when we delete its last contract
  if (contract.offerId) {
    const offerContractsRef = db.collection('contracts').where('offerId', '==', contract.offerId);
    const offerContractsSnap = await offerContractsRef.get();
    if (offerContractsSnap.empty) {
      await db.doc(`offers/${contract.offerId}`).delete();
    }
  }

  // Delete incomes documents, if any
  const incomesCollectionRef = db.collection('incomes').where('contractId', '==', contract.id);
  const incomesSnap = await incomesCollectionRef.get();
  for (const income of incomesSnap.docs) {
    await income.ref.delete();
  }

  console.log(`Contract ${contract.id} removed`);
}


export async function onContractUpdate(
  change: Change<FirebaseFirestore.DocumentSnapshot>
) {

  const before = change.before;
  const after = change.after;

  if (!before || !after) {
    throw new Error('Parameter "change" not found');
  }

  const contractBefore = before.data() as Sale | Mandate | undefined;
  const contractAfter = after.data() as Sale | Mandate | undefined;

  // KEEP THE OFFER STATUS IN SYNC WITH IT'S CONTRACTS
  const isUpdated = contractBefore && contractAfter // contract was updated (not created nor deleted)
  const isSale = contractBefore.type === contractAfter.type && contractBefore.type === 'sale' // contract is of type 'sale'
  const statusHasChanged = contractBefore.status !== contractAfter.status // contract status has changed

  if (isUpdated && isSale && statusHasChanged) {

    const offerRef = db.doc(`offers/${contractAfter.offerId}`);
    const offerSnap = await offerRef.get();
    const offer = offerSnap.data() as Offer;

    if (offer.status !== 'signed' && offer.status !== 'signing') {

      const offerContractsQuery = db.collection('contracts')
        .where('offerId', '==', contractAfter.offerId)
        .where('type', '==', 'sale');
      const offerContractsSnap = await offerContractsQuery.get();

      const contractsStatus: ContractStatus[] = offerContractsSnap.docs.map(doc => doc.data().status);

      let newOfferStatus = offer.status;
      newOfferStatus = contractsStatus.every(status => status !== 'accepted') ? 'pending' : newOfferStatus;
      newOfferStatus = contractsStatus.some(status => status !== 'pending') ? 'negotiating' : newOfferStatus;
      newOfferStatus = contractsStatus.every(status => status === 'accepted') ? 'accepted' : newOfferStatus;
      newOfferStatus = contractsStatus.every(status => status === 'declined') ? 'declined' : newOfferStatus;

      offerRef.update({ status: newOfferStatus });
    }
  }
}
