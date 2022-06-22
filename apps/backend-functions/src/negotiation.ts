import { db } from './internals/firebase';
import { EventContext } from 'firebase-functions';
import { centralOrgId } from '@env';
import { Contract, Negotiation, Organization, Sale, NotificationTypes, Offer, ContractStatus, createInternalDocumentMeta, createNotification } from '@blockframes/model';
import { triggerNotifications } from './notification';
import { getReviewer, isInitial } from '@blockframes/contract/negotiation/utils'
import { getDocument, queryDocument, queryDocuments, BlockframesChange, BlockframesSnapshot } from '@blockframes/firebase-utils';

// KEEP THE OFFER STATUS IN SYNC WITH IT'S CONTRACTS AND NEGOTIATIONS
async function updateOfferStatus(contract: Contract) {
  return db.runTransaction(async tx => {

    const lastNegotiation = id => {
      const query = db.collection(`contracts/${id}/negotiations`)
        .orderBy('_meta.createdAt', 'desc');
      return queryDocument<Negotiation>(query, tx);
    }

    const offerPath = `offers/${contract.offerId}`;
    const offer = await getDocument<Offer>(offerPath, db, tx);
    const offerRef = db.doc(offerPath);

    if (['signed', 'signing'].includes(offer.status)) return;


    const offerContractsQuery = db.collection('contracts')
      .where('offerId', '==', contract.offerId)
      .where('type', '==', 'sale');
    const offerContractsSnap = await queryDocuments<Contract>(offerContractsQuery, tx);
    const negotiationSnaps = await Promise.all(offerContractsSnap.map(doc => lastNegotiation(doc.id)));

    const contractsStatus: ContractStatus[] = negotiationSnaps.map(nego => {
      const _meta = nego._meta;
      const initial = nego.initial;
      const isPending = nego.status === 'pending';
      if (isInitial({ _meta, initial }) && isPending) return 'pending';
      if (isPending) return 'negotiating';
      return nego.status;
    });

    let newOfferStatus = offer.status;
    const negotiatingStatuses = ['negotiating', 'accepted', 'declined'];
    const acceptedStatuses = ['accepted', 'declined'];
    if (contractsStatus.some(status => negotiatingStatuses.includes(status))) newOfferStatus = 'negotiating';
    if (contractsStatus.every(status => acceptedStatuses.includes(status))) newOfferStatus = 'accepted';
    if (contractsStatus.every(status => status === 'declined')) newOfferStatus = 'declined';
    if (contractsStatus.every(status => status === 'pending')) newOfferStatus = 'pending';

    if (newOfferStatus === offer.status) return;
    return tx.update(offerRef, { status: newOfferStatus });
  })
}

export async function onNegotiationCreated(negotiationSnapshot: BlockframesSnapshot<Negotiation>) {
  const negotiation = negotiationSnapshot.data();
  const _meta = negotiation._meta;
  const initial = negotiation.initial;

  const path = negotiationSnapshot.ref.path;
  const contractId = path.split('/')[1]
  const contract = await getDocument<Sale>(`/contracts/${contractId}`);

  const getNotifications = (type: NotificationTypes) => (org: Organization) => org.userIds.map(userId => createNotification({
    toUserId: userId,
    type,
    docId: contractId,
    offerId: contract.offerId,
    docPath: path,
    _meta: createInternalDocumentMeta({ createdFrom: 'catalog' })
  }));

  //Send notification to seller about an offer made on his title.
  if (isInitial({ _meta, initial })) {
    const stakeholders = negotiation.stakeholders.filter(stakeholder => {
      return ![contract.buyerId, centralOrgId.catalog].includes(stakeholder);
    });

    if (!stakeholders.length) return;

    const promises = stakeholders.map(stakeholder =>
      getDocument<Organization>(`orgs/${stakeholder}`)
        .then(getNotifications('contractCreated'))
        .then(triggerNotifications)
    );
    return Promise.all(promises);

  };

  await updateOfferStatus(contract)

  const recipientOrg = getReviewer(negotiation);

  //for org whose offer was accepted.
  const promises = [
    getDocument<Organization>(`orgs/${negotiation.createdByOrg}`)
      .then(getNotifications('createdCounterOffer'))
  ];
  if (recipientOrg) promises.push(
    getDocument<Organization>(`orgs/${recipientOrg}`)
      .then(getNotifications('receivedCounterOffer'))
  );

  const notifications = await Promise.all(promises);
  return triggerNotifications(notifications.flat());
}

export async function onNegotiationUpdate(change: BlockframesChange<Negotiation>, context: EventContext) {

  const { contractId } = context.params;
  const before = change.before?.data();
  const after = change.after?.data();

  if (!before || !after) {
    throw new Error('Parameter "change" not found');
  }

  const hasStatusChanged = before.status !== after.status;

  if (!hasStatusChanged) return;

  const contract = await getDocument<Sale>(`/contracts/${contractId}`);
  await updateOfferStatus(contract);

  const { status, declineReason = '' } = after;

  const updates: Partial<Sale> = { declineReason, status };

  db.doc(`contracts/${contractId}`).update(updates);
}
