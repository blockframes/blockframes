import { db } from './internals/firebase';
import { Contract, ContractStatus, Mandate, Sale } from '@blockframes/contract/contract/+state/contract.model';
import { Change } from 'firebase-functions';
import { Offer } from '@blockframes/contract/offer/+state';
import { centralOrgId } from '@env'
import { Organization } from '@blockframes/organization/+state';
import { createNotification, triggerNotifications } from './notification';
import { createDocumentMeta, getDocument, Timestamp } from './data/internals';
import { Negotiation } from '@blockframes/contract/negotiation/+state/negotiation.firestore';
import { createId } from './utils';


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

export async function onContractCreate(contractSnapshot: FirebaseFirestore.DocumentSnapshot<Contract>) {
  const contract = contractSnapshot.data() as Contract;

  if (contract.type !== 'sale') return;

  const stakeholders = contract.stakeholders.filter(stakeholder => {
    return (stakeholder !== contract.buyerId) && stakeholder !== centralOrgId.catalog;
  });

  if (!stakeholders.length) return;

  const getNotifications = (org: Organization) => org.userIds.map(userId => createNotification({
    toUserId: userId,
    type: 'contractCreated',
    docId: contract.id,
    _meta: createDocumentMeta({ createdFrom: 'catalog' })
  }));

  for (const stakeholder of stakeholders) {
    getDocument<Organization>(`orgs/${stakeholder}`)
      .then(getNotifications)
      .then(triggerNotifications);
  }
}


async function deleteCurrentTerms(ref: FirebaseFirestore.Query) {
  const currentTerms = await ref.get()
  const deletions = currentTerms.docs.map(term => term.ref.delete());
  return Promise.all(deletions);
}
async function createTerms(contractId: string, negotiation: Negotiation<Timestamp>, tx: FirebaseFirestore.Transaction) {
  const termsCollection = db.collection('terms');
  const terms = negotiation.terms
    .map(t => ({ ...t, contractId, id: createId() }));

  const createTerm = term => tx.create(termsCollection.doc(term.id), term);
  await Promise.all(terms.map(createTerm));
  return terms.map(datum => datum.id);
}

async function createIncome(sale: Sale, negotiation: Negotiation<Timestamp>, tx: FirebaseFirestore.Transaction) {
  const doc = db.doc(`incomes/${sale.id}`);
  return tx.set(doc, {
    status: 'pending',
    termsId: sale.parentTermId,
    price: negotiation.price,
    currency: negotiation.currency,
    offerId: sale.offerId
  });
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
  const isSale = contractBefore.type === contractAfter.type && contractBefore.type === 'sale' // contract is of type 'sale'
  const statusHasChanged = contractBefore.status !== contractAfter.status // contract status has changed
  const { status, id } = contractAfter;

  if (isSale && statusHasChanged) {
    db.runTransaction(async tx => {
      const offerRef = db.doc(`offers/${contractAfter.offerId}`);
      const offer = await tx.get(offerRef).then(snap => snap.data()) as Offer;

      if (offer.status === 'signed' || offer.status === 'signing') return

      const offerContractsQuery = db.collection('contracts')
        .where('offerId', '==', contractAfter.offerId)
        .where('type', '==', 'sale');
      const offerContractsSnap = await tx.get(offerContractsQuery);

      const contractsStatus: ContractStatus[] = offerContractsSnap.docs.map(doc => doc.data().status);

      let newOfferStatus = offer.status;
      const negotiatingStatuses = ['negotiating', 'accepted', 'declined'];
      const acceptedStatuses = ['accepted', 'declined'];
      newOfferStatus = contractsStatus.some(status => negotiatingStatuses.includes(status)) ? 'negotiating' : newOfferStatus;
      newOfferStatus = contractsStatus.every(status => acceptedStatuses.includes(status)) ? 'accepted' : newOfferStatus;
      newOfferStatus = contractsStatus.every(status => status === 'declined') ? 'declined' : newOfferStatus;
      newOfferStatus = contractsStatus.every(status => status === 'pending') ? 'pending' : newOfferStatus;

      if (newOfferStatus === offer.status) return;
      await tx.update(offerRef, { status: newOfferStatus });
    })
    const saleRef = change.after.ref;
    const negotiationRef = saleRef.collection('negotiations').orderBy('_meta.createdAt', 'desc').limit(1);
    const incomeDoc = db.doc(`incomes/${saleRef.id}`);
    const termsCollection = db.collection('terms').where('contractId', '==', saleRef.id);

    await Promise.all([incomeDoc.delete(), deleteCurrentTerms(termsCollection)]);

    if (status === 'accepted') {
      db.runTransaction(async tx => {
        const negotiation = await tx.get(negotiationRef)
          .then(snap => snap.docs[0].data()) as Negotiation<Timestamp>;

        const termIds = await createTerms(id, negotiation, tx);
        await createIncome(contractAfter as Sale, negotiation, tx);
        await tx.update(saleRef, { termIds });
      })
    }
  }
}
