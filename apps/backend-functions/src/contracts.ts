import { db } from './internals/firebase';
import { Contract, Sale } from '@blockframes/contract/contract/+state/contract.model';
import { Change } from 'firebase-functions';
import { centralOrgId } from '@env'
import { Organization } from '@blockframes/organization/+state';
import { createNotification, triggerNotifications } from './notification';
import { createDocumentMeta, getDocument, Timestamp } from './data/internals';
import { Negotiation } from '@blockframes/contract/negotiation/+state/negotiation.firestore';
import { createId } from './utils';
import { ContractStatusChange } from '@blockframes/contract/contract/+state/contract.firestore';
import { NotificationDocument } from './data/types';


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

interface ContractNotificationType{
  actorOrg: 'acceptedContract' | 'declinedContract', //org who accepted/declined a contract
  receptorOrg: 'contractAccepted' | 'contractDeclined', // Org whose contract was accepted/declined
}

async function getContractNotifications(contractId: string, offerId: string, negotiation: Negotiation<Timestamp>, types:ContractNotificationType ) {
  //send to org who accepted/declined the offer
  const actorOrgNotifs = (org: Organization) => org.userIds.map(userId => createNotification({
    toUserId: userId,
    type: types.actorOrg,
    docId: contractId,
    offerId,
    docPath: `contracts/${contractId}/negotiations/${negotiation.id}`,
    _meta: createDocumentMeta({ createdFrom: 'catalog' })
  }));

  //for org whose offer was accepted/declined.
  const receptorOrgNotifs = (org: Organization) => org.userIds.map(userId => createNotification({
    toUserId: userId,
    type: types.receptorOrg,
    docId: contractId,
    offerId,
    docPath: `contracts/${contractId}/negotiations/${negotiation.id}`,
    _meta: createDocumentMeta({ createdFrom: 'catalog' })
  }));

  const excluded = [negotiation.createdByOrg, centralOrgId.catalog]
  const receptorOrg = negotiation.stakeholders.find(stakeholder => !excluded.includes(stakeholder));

  //for org whose offer was accepted.
  const promises = [getDocument<Organization>(`orgs/${negotiation.createdByOrg}`).then(receptorOrgNotifs)];
  if (receptorOrg) promises.push(getDocument<Organization>(`orgs/${receptorOrg}`).then(actorOrgNotifs))

  const notifications = await Promise.all(promises);

  return notifications.flat(1);
}

async function getContractAcceptedNotifications(contractId: string, offerId: string, negotiation: Negotiation<Timestamp>) {
  return getContractNotifications(contractId, offerId, negotiation, {actorOrg: 'acceptedContract', receptorOrg: 'contractAccepted'})
}

async function getContractDeclinedNotifications(contractId: string, offerId: string, negotiation: Negotiation<Timestamp>) {
  return getContractNotifications(contractId, offerId, negotiation, {actorOrg: 'declinedContract', receptorOrg: 'contractDeclined'})
}

export type ContractActions = 'contractAccepted' | 'contractDeclined' | 'contractInNegotiation'

async function sendContractUpdateNotification(before: Sale, after: Sale, negotiation: Negotiation<Timestamp>) {
  const statusChange: ContractStatusChange = `${before.status} => ${after.status}` as const;
  const types: Partial<Record<ContractStatusChange, ContractActions>> = {
    "pending => accepted": 'contractAccepted',
    "declined => accepted": 'contractAccepted',
    "pending => declined": 'contractDeclined',
    "accepted => declined": 'contractDeclined',
    "declined => pending": 'contractInNegotiation',
    "accepted => pending": 'contractInNegotiation',
  };

  const type = types[statusChange];
  if (!type) return;


  let notifications: NotificationDocument[] = [];
  switch (type) {
    case 'contractAccepted': notifications = await getContractAcceptedNotifications(after.id, after.offerId, negotiation);
      break;
    case 'contractDeclined': notifications = await getContractDeclinedNotifications(after.id, after.offerId, negotiation);
      break;
  }
  if (notifications.length) triggerNotifications(notifications);
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

  // KEEP THE OFFER STATUS IN SYNC WITH IT'S CONTRACTS
  const isSale = contractBefore.type === contractAfter.type && contractBefore.type === 'sale' // contract is of type 'sale'
  const statusHasChanged = contractBefore.status !== contractAfter.status // contract status has changed
  const { status, id } = contractAfter;
  const saleRef = change.after.ref;
  const negotiationRef = saleRef.collection('negotiations').orderBy('_meta.createdAt', 'desc').limit(1);
  const negotiation = await negotiationRef.get()
    .then(snap => snap.docs[0].data()) as Negotiation<Timestamp>;

  if (isSale && statusHasChanged) {
    const incomeDoc = db.doc(`incomes/${saleRef.id}`);
    const termsCollection = db.collection('terms').where('contractId', '==', saleRef.id);

    await Promise.all([
      incomeDoc.delete(),
      deleteCurrentTerms(termsCollection),
      saleRef.update({ termIds: [] }),
      sendContractUpdateNotification(contractBefore, contractAfter, negotiation)
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
