import { db } from './internals/firebase';
import { Contract, Sale } from '@blockframes/contract/contract/+state/contract.model';
import { Change } from 'firebase-functions';
import { Organization } from '@blockframes/organization/+state';
import { createNotification, triggerNotifications } from './notification';
import { createDocumentMeta, getDocument, Timestamp } from './data/internals';
import { Negotiation } from '@blockframes/contract/negotiation/+state/negotiation.firestore';
import { getReviewer } from './negotiation';
import { NotificationDocument } from './data/types';


function createId() {
  return db.collection('_').doc().id;
}

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

interface ContractNotificationType {
  sender: 'myOrgAcceptedAContract' | 'myOrgDeclinedAContract', //org who accepted/declined a contract
  recipient: 'myContractWasAccepted' | 'myContractWasDeclined' | 'receivedCounterOffer', // Org whose contract was accepted/declined
}
type ContractNotificationValues = ContractNotificationType[keyof ContractNotificationType];


async function getContractNotifications(
  contractId: string, offerId: string, negotiation: Negotiation<Timestamp>, types: Partial<ContractNotificationType>
) {

  const sendOrgNotifications = (type: ContractNotificationValues) => (org: Organization) => {
    return org.userIds.map(userId => createNotification({
      toUserId: userId,
      docId: contractId,
      offerId,
      type,
      docPath: `contracts/${contractId}/negotiations/${negotiation.id}`,
      _meta: createDocumentMeta({ createdFrom: 'catalog' })
    }));
  };

  const promises: Promise<NotificationDocument[]>[] = [];

  if (types.sender) {
    const orgId = getReviewer(negotiation);
    const promise = getDocument<Organization>(`orgs/${orgId}`)
      .then(sendOrgNotifications(types.sender));
    promises.push(promise);
  }

  if (types.recipient) {
    const promise = getDocument<Organization>(`orgs/${negotiation.createdByOrg}`)
      .then(sendOrgNotifications(types.recipient));
    promises.push(promise);
  }
  const notifications = await Promise.all(promises);
  return notifications.flat();
}

async function sendContractUpdatedNotification(before: Sale, after: Sale, negotiation: Negotiation<Timestamp>) {
  if (before.status === after.status) return;
  let params: Partial<ContractNotificationType>;
  if (after.status === 'accepted') {
    params = { sender: 'myOrgAcceptedAContract', recipient: 'myContractWasAccepted' };
  } else if (after.status === 'declined') {
    params = { sender: 'myOrgDeclinedAContract', recipient: 'myContractWasDeclined' };
  } else if (after.status === 'pending') {
    params = { recipient: 'receivedCounterOffer' };
  }
  if (!params) return;
  const notifications = await getContractNotifications(after.id, after.offerId, negotiation, params);
  return triggerNotifications(notifications);
}

export async function onContractUpdate(
  change: Change<FirebaseFirestore.DocumentSnapshot>
) {

  const before = change.before;
  const after = change.after;

  if (!before || !after) {
    throw new Error('Parameter "change" not found');
  }

  const contractBefore = before.data() as Sale;
  const contractAfter = after.data() as Sale;

  const isSale = contractBefore.type === contractAfter.type && contractBefore.type === 'sale' // contract is of type 'sale'
  const statusHasChanged = contractBefore.status !== contractAfter.status // contract status has changed
  const { status, id } = contractAfter;
  const saleRef = change.after.ref;
  const negotiationRef = saleRef.collection('negotiations').orderBy('_meta.createdAt', 'desc').limit(1);
  const negotiation = await negotiationRef.get()
    .then(snap => snap.docs[0]?.data()) as Negotiation<Timestamp>;

  if (!negotiation) return;


  if (isSale && statusHasChanged) {
    const incomeDoc = db.doc(`incomes/${saleRef.id}`);
    const termsCollection = db.collection('terms').where('contractId', '==', saleRef.id);

    await Promise.all([
      incomeDoc.delete(),
      deleteCurrentTerms(termsCollection),
      saleRef.update({ termIds: [] }),
      sendContractUpdatedNotification(contractBefore, contractAfter, negotiation)
    ]);

    if (status === 'accepted') {
      db.runTransaction(async tx => {

        const termIds = await createTerms(id, negotiation, tx);
        await createIncome(contractAfter as Sale, negotiation, tx);
        await tx.update(saleRef, { termIds });
      })
    }
  }
}
