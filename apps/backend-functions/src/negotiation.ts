import { db } from './internals/firebase';
import { Change, EventContext } from 'firebase-functions';
import { Negotiation } from '@blockframes/contract/negotiation/+state/negotiation.firestore';
import { createDocumentMeta, getDocument, Timestamp } from './data/internals';
import { centralOrgId } from 'env/env.blockframes-ci';
import { Organization } from '@blockframes/organization/+state';
import { createNotification, triggerNotifications } from './notification';
import { isInitial } from '@blockframes/contract/negotiation/utils'
import { formatDocumentMetaFromFirestore } from "@blockframes/utils/models-meta";
import { Offer } from '@blockframes/contract/offer/+state';
import { Contract, ContractStatus, Sale } from '@blockframes/contract/contract/+state/contract.model';

export async function updateOfferStatus(contract: Contract) {
  return db.runTransaction(async tx => {

    const lastNegotiation = id => {
      const query = db.collection(`contracts/${id}/negotiations`)
        .orderBy('_meta.createdAt', 'desc').limit(1);
      return tx.get(query)
        .then(snap => snap.docs[0].data() as Negotiation<Timestamp>);
    }

    const offerRef = db.doc(`offers/${contract.offerId}`);
    const offer = await tx.get(offerRef).then(snap => snap.data()) as Offer;

    if (['signed', 'signing'].includes(offer.status)) return

    const offerContractsQuery = db.collection('contracts')
      .where('offerId', '==', contract.offerId)
      .where('type', '==', 'sale');
    const offerContractsSnap = await tx.get(offerContractsQuery);
    const negotiationSnaps = await Promise.all(offerContractsSnap.docs.map(doc => lastNegotiation(doc.id)));

    const contractsStatus: ContractStatus[] = negotiationSnaps.map(nego => {
      const _meta = formatDocumentMetaFromFirestore(nego._meta);
      const initial = nego.initial.toDate();
      const pending = nego.status === 'pending';
      if (isInitial({ _meta, initial }) && pending) return 'pending';
      else if (pending) return 'negotiating';
      else return nego.status;
    });

    let newOfferStatus = offer.status;
    const negotiatingStatuses = ['negotiating', 'accepted', 'declined'];
    const acceptedStatuses = ['accepted', 'declined'];
    newOfferStatus = contractsStatus.some(status => negotiatingStatuses.includes(status)) ? 'negotiating' : newOfferStatus;
    newOfferStatus = contractsStatus.every(status => acceptedStatuses.includes(status)) ? 'accepted' : newOfferStatus;
    newOfferStatus = contractsStatus.every(status => status === 'declined') ? 'declined' : newOfferStatus;
    newOfferStatus = contractsStatus.every(status => status === 'pending') ? 'pending' : newOfferStatus;

    if (newOfferStatus === offer.status) return;
    return tx.update(offerRef, { status: newOfferStatus });
  })
}

export async function onNegotiationCreated(negotiationSnapshot: FirebaseFirestore.DocumentSnapshot<Negotiation<Timestamp>>) {
  const negotiation = negotiationSnapshot.data();
  const _meta = formatDocumentMetaFromFirestore(negotiation._meta);
  const initial = negotiation.initial.toDate();

  if (isInitial({ _meta, initial })) return;

  const path = negotiationSnapshot.ref.path;
  // contracts/{contractId}/negotiations/{negotiationId}
  const contractId = path.split('/')[1]

  const contract = await getDocument<Sale>(`/contracts/${contractId}`);
  await updateOfferStatus(contract)

  const stakeholders = negotiation.stakeholders.filter(stakeholder => {
    return ![negotiation.createdByOrg, centralOrgId.catalog].includes(stakeholder)
  });

  if (!stakeholders.length) return;

  const getNotifications = (org: Organization) => org.userIds.map(userId => createNotification({
    toUserId: userId,
    type: 'negotiationCreated',
    docId: contractId,
    offerId:contract.offerId,
    docPath: path,
    _meta: createDocumentMeta({ createdFrom: 'catalog' })
  }));

  for (const stakeholder of stakeholders) {
    getDocument<Organization>(`orgs/${stakeholder}`)
      .then(getNotifications)
      .then(triggerNotifications);
  }
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

  const contract = await getDocument<Sale>(`/contracts/${contractId}`);
  await updateOfferStatus(contract)

  const { status, declineReason = "" } = after;

  const updates: Partial<Sale> = { declineReason, status }

  db.doc(`contracts/${contractId}`).update(updates);
}

