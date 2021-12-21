import { db } from './internals/firebase';
import { Change, EventContext } from 'firebase-functions';
import { Negotiation } from '@blockframes/contract/negotiation/+state/negotiation.firestore';
import { Sale } from '@blockframes/contract/contract/+state';

function createId() {
  return db.collection('_').doc().id;
}

async function createTerms(contractId: string, negotiation: Negotiation) {
  const termsCollection = db.collection('terms');
  const currentTerms = await termsCollection.where('contractId', '==', contractId).get()

  const deletions = currentTerms.docs.map(term => term.ref.delete());
  await Promise.all(deletions);

  const terms = negotiation.terms
    .map(t => ({ ...t, contractId, id: createId() }));
  const termIds = terms.map(t => t.id);
  const promises = terms.map(term => termsCollection.add(term));
  await Promise.all(promises);
  return termIds;
}

async function createIncome(sale: Sale, negotiation: Negotiation) {
  const doc = db.doc(`incomes/${sale.id}`);
  await doc.delete()
  return doc.set({
    status: 'pending',
    termsId: sale.parentTermId,
    price: negotiation.price,
    currency: negotiation.currency,
    offerId: sale.offerId
  });
}


export async function onNegotiationUpdate(
  change: Change<FirebaseFirestore.DocumentSnapshot>, context: EventContext
) {

  const { contractId } = context.params
  const before = change.before?.data() as Negotiation;
  const after = change.after?.data() as Negotiation;

  if (!before || !after) {
    throw new Error('Parameter "change" not found');
  }

  const hasStatusChanged = before.status !== after.status

  if (!hasStatusChanged) return;

  const { status, declineReason = "" } = after;

  let updates: Partial<Sale> = { declineReason, status }

  if (status === 'accepted') {
    const contractSnapshot = await db.doc(`contracts/${contractId}`).get();
    const sale = contractSnapshot.data() as Sale;
    const termIds = await createTerms(contractId, after)
    await createIncome(sale, after)
    updates = { termIds, status }
  }

  db.doc(`contracts/${contractId}`).update(updates);
}
