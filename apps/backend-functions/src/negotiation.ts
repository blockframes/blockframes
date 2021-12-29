import { db } from './internals/firebase';
import { Change, EventContext } from 'firebase-functions';
import { Negotiation } from '@blockframes/contract/negotiation/+state/negotiation.firestore';
import { Sale } from '@blockframes/contract/contract/+state';
import { createDocumentMeta, getDocument, Timestamp } from './data/internals';
import { centralOrgId } from 'env/env.blockframes-ci';
import { Organization } from '@blockframes/organization/+state';
import { createNotification, triggerNotifications } from './notification';
import { isInitial } from '@blockframes/contract/negotiation/utils'
import { formatDocumentMetaFromFirestore } from "@blockframes/utils/models-meta";

function createId() {
  return db.collection('_').doc().id;
}

export async function onNegotiationCreated(contractSnapshot: FirebaseFirestore.DocumentSnapshot<Negotiation<Timestamp>>) {
  const negotiation = contractSnapshot.data();
  const _meta = formatDocumentMetaFromFirestore(negotiation._meta);
  const initial = negotiation.initial.toDate();

  if (isInitial({ _meta, initial })) return;

  const path = contractSnapshot.ref.path;
  // contracts/{contractId}/negotiations/{negotiationId}
  const contractId = path.split('/')[1]


  const stakeholders = negotiation.stakeholders.filter(stakeholder => {
    return ![negotiation.createdByOrg, centralOrgId.catalog].includes(stakeholder)
  });

  if (!stakeholders.length) return;

  const getNotifications = (org: Organization) => org.userIds.map(userId => createNotification({
    toUserId: userId,
    type: 'negotiationCreated',
    docId: contractId,
    _meta: createDocumentMeta({ createdFrom: 'catalog' })
  }));

  for (const stakeholder of stakeholders) {
    getDocument<Organization>(`orgs/${stakeholder}`)
      .then(getNotifications)
      .then(triggerNotifications);
  }
}

async function createNegotiationUpdateNotification(contractSnapshot: FirebaseFirestore.DocumentSnapshot<Negotiation<Timestamp>>) {
  const negotiation = contractSnapshot.data();

  const path = contractSnapshot.ref.path;
  const contractId = path.split('/')[1]

  let type: 'negotiationAccepted' | 'negotiationDeclined' = 'negotiationAccepted';
  if (negotiation.status === 'declined')
    type = 'negotiationDeclined';


  const stakeholder = negotiation.createdByOrg

  const getNotifications = (org: Organization) => org.userIds.map(userId => createNotification({
    toUserId: userId,
    type,
    docId: contractId,
    _meta: createDocumentMeta({ createdFrom: 'catalog' })
  }));

  await getDocument<Organization>(`orgs/${stakeholder}`)
    .then(getNotifications)
    .then(triggerNotifications);
}

async function createTerms(contractId: string, negotiation: Negotiation<Timestamp>) {
  const termsCollection = db.collection('terms');
  const currentTerms = await termsCollection.where('contractId', '==', contractId).get()

  const deletions = currentTerms.docs.map(term => term.ref.delete());
  await Promise.all(deletions);
  const terms = negotiation.terms
    .map(t => ({ ...t, contractId, id: createId() }));
  const promises = terms.map(term => termsCollection.add(term));
  const savedTerms = await Promise.all(promises);
  return savedTerms.map(datum => datum.id);
}

async function createIncome(sale: Sale, negotiation: Negotiation<Timestamp>) {
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
  change: Change<FirebaseFirestore.DocumentSnapshot<Negotiation<Timestamp>>>, context: EventContext
) {

  const { contractId } = context.params
  const before = change.before?.data();
  const after = change.after?.data();

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

  if (['accepted', 'declined'].includes(status))
    createNegotiationUpdateNotification(change.after)

  db.doc(`contracts/${contractId}`).update(updates);
}

