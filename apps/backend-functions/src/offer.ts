import { db } from './internals/firebase';
import { getDocument } from '@blockframes/firebase-utils';
import { Offer } from '@blockframes/contract/offer/+state/offer.model';
import { Movie, Organization, User, NotificationTypes, Sale } from '@blockframes/model';
import { staticModel } from '@blockframes/utils/static-model';
import { createNotification, triggerNotifications } from './notification';
import { Change } from 'firebase-functions';
import { createDocumentMeta } from './data/internals';
import { getSeller } from '@blockframes/contract/contract/+state/utils';

export async function onOfferCreate(snap: FirebaseFirestore.DocumentSnapshot): Promise<void> {
  const offer = snap.data() as Offer;
  const orgId = offer.buyerId;
  const bucket = await getDocument<any>(`buckets/${orgId}`);
  
  const user = await getDocument<User>(`users/${bucket.uid}`);

  // Empty bucket
  db.doc(`buckets/${orgId}`).update({ contracts: [], uid: null });

  bucket.currency = staticModel['movieCurrencies'][bucket.currency];
  for (const contract of bucket.contracts) {
    const movie = await getDocument<Movie>(`movies/${contract.titleId}`);
    contract['title'] = movie.title.international;
  }

  // Send copy of offer to user who created the offer
  const notification = createNotification({
    toUserId: user.uid,
    type: 'offerCreatedConfirmation',
    docId: snap.id,
    bucket,
  });
  triggerNotifications([notification]);
}

export async function onOfferUpdate(change: Change<FirebaseFirestore.DocumentSnapshot>) {
  const before = change.before;
  const after = change.after;

  if (!before || !after) {
    throw new Error('Parameter "change" not found');
  }

  const offerBefore = before.data() as Offer;
  const offerAfter = after.data() as Offer;

  const statusHasChanged = offerBefore.status !== offerAfter.status;
  const isOfferDeclinedOrAccepted = ['accepted', 'declined'].includes(offerAfter.status);

  const getNotifications = (type: NotificationTypes, docId: string) => (org: Organization) =>
    org.userIds.map((userId) =>
      createNotification({
        toUserId: userId,
        type,
        docId,
        _meta: createDocumentMeta({ createdFrom: 'catalog' }),
      })
    );
  if (statusHasChanged && isOfferDeclinedOrAccepted) {
    const type = offerAfter.status === 'accepted' ? 'offerAccepted' : 'offerDeclined';
    getDocument<Organization>(`orgs/${offerAfter.buyerId}`)
      .then(getNotifications(type, offerAfter.id))
      .then(triggerNotifications);
  }

  if (offerAfter.status === 'accepted') {
    const contractsRef = db
      .collection('contracts')
      .where('offerId', '==', offerAfter.id)
      .where('status', '==', 'accepted');
    const contracts = await contractsRef
      .get()
      .then((snaps) => snaps.docs.map((doc) => doc.data() as Sale));

    contracts.forEach((contract) => {
      getDocument<Organization>(`orgs/${getSeller(contract)}`)
        .then(getNotifications('underSignature', contract.id))
        .then(triggerNotifications);
    });
  }
}
