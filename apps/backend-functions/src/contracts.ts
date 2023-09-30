import { queryDocument, getDocument, BlockframesChange, BlockframesSnapshot } from '@blockframes/firebase-utils';
import { db } from './internals/firebase';
import { airtable } from './internals/airtable';
import { tables } from '@env';
import { triggerNotifications } from './notification';
import { getReviewer } from '@blockframes/contract/negotiation/utils';
import {
  Organization,
  Notification,
  Sale,
  Contract,
  Negotiation,
  createInternalDocumentMeta,
  createNotification,
  createIncome,
  createTerm,
  Movie,
  Income,
  contractToDetailedContract,
  mandatesToExport,
  salesToExport,
  Mandate,
} from '@blockframes/model';

interface ContractNotificationType {
  sender: 'myOrgAcceptedAContract' | 'myOrgDeclinedAContract', //org who accepted/declined a contract
  recipient: 'myContractWasAccepted' | 'myContractWasDeclined' | 'receivedCounterOffer', // Org whose contract was accepted/declined
}
type ContractNotificationValues = ContractNotificationType[keyof ContractNotificationType];

export async function onContractDelete(contractSnapshot: BlockframesSnapshot<Contract>) {
  const contract = contractSnapshot.data();

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


async function createTerms(contractId: string, negotiation: Negotiation, tx: FirebaseFirestore.Transaction) {
  const termsCollection = db.collection('terms');
  const terms = negotiation.terms
    .map(t => createTerm({ ...t, contractId, id: termsCollection.doc().id }));

  const createTermDoc = term => tx.create(termsCollection.doc(term.id), term);
  await Promise.all(terms.map(createTermDoc));
  return terms.map(datum => datum.id);
}

function createIncomeDoc(sale: Sale, negotiation: Negotiation, tx: FirebaseFirestore.Transaction) {
  const incomesCollection = db.collection('incomes');
  const income = createIncome({
    id: incomesCollection.doc().id,
    _meta: createInternalDocumentMeta({ createdFrom: 'catalog' }),
    status: 'pending',
    contractId: sale.id,
    termId: sale.parentTermId,
    price: negotiation.price,
    currency: negotiation.currency,
    offerId: sale.offerId
  });
  return tx.create(incomesCollection.doc(income.id), income);
}

async function getContractNotifications(
  contractId: string, offerId: string, negotiation: Negotiation, types: Partial<ContractNotificationType>
) {

  const sendOrgNotifications = (type: ContractNotificationValues) => (org: Organization) => {
    return org.userIds.map(userId => createNotification({
      toUserId: userId,
      docId: contractId,
      offerId,
      type,
      docPath: `contracts/${contractId}/negotiations/${negotiation.id}`,
      _meta: createInternalDocumentMeta({ createdFrom: 'catalog' })
    }));
  };

  const promises: Promise<Notification[]>[] = [];

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

async function sendContractUpdatedNotification(before: Sale, after: Sale, negotiation: Negotiation) {
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

export async function onContractUpdate(change: BlockframesChange<Sale>) {
  const before = change.before;
  const after = change.after;

  if (!before || !after) {
    throw new Error('Parameter "change" not found');
  }

  const contractBefore = before.data();
  const contractAfter = after.data();

  const isSale = contractBefore.type === contractAfter.type && contractBefore.type === 'sale' // contract is of type 'sale'
  const statusHasChanged = contractBefore.status !== contractAfter.status // contract status has changed
  const { status, id } = contractAfter;
  const saleRef = change.after.ref;
  const negotiationRef = saleRef.collection('negotiations').orderBy('_meta.createdAt', 'desc');
  const negotiation = await queryDocument<Negotiation>(negotiationRef);

  if (!negotiation) return;


  if (isSale && statusHasChanged) {
    // Delete previous incomes and terms
    const incomesRef = db.collection('incomes').where('contractId', '==', saleRef.id);
    const incomesSnap = await incomesRef.get();

    const termsRef = db.collection('terms').where('contractId', '==', saleRef.id);
    const termsSnap = await termsRef.get();

    await Promise.all([
      ...incomesSnap.docs.map(i => i.ref.delete()),
      ...termsSnap.docs.map(t => t.ref.delete()),
      saleRef.update({ termIds: [] }),
      sendContractUpdatedNotification(contractBefore, contractAfter, negotiation)
    ]);

    // Re-create income and terms
    if (status === 'accepted') {
      db.runTransaction(async tx => {

        const termIds = await createTerms(id, negotiation, tx);
        createIncomeDoc(contractAfter as Sale, negotiation, tx);
        tx.update(saleRef, { termIds });
      });
    }
  }
}

export async function updateAirtableContracts({
  mandates,
  sales,
  orgs,
  movies,
  incomes,
  lastNegotiations,
}: {
  mandates: Mandate[];
  sales: Sale[];
  orgs: Organization[];
  movies: Movie[];
  incomes: Income[];
  lastNegotiations: (Negotiation & { contractId: string })[];
}) {
  console.log('===== Updating contracts =====');

  const detailedMandates = contractToDetailedContract(mandates, orgs, movies);

  const detailedSales = contractToDetailedContract(sales, orgs, movies, incomes, lastNegotiations);

  const rows = mandatesToExport(detailedMandates, 'airtable').concat(salesToExport(detailedSales, 'airtable'));

  const synchronization = await airtable.synchronize(tables.contracts, rows, 'id');
  console.log(synchronization);
}
