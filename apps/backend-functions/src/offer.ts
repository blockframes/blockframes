import { db } from './internals/firebase';
import { getDocument } from '@blockframes/firebase-utils';
import { EmailTemplateRequest, sendMailFromTemplate } from './internals/email';
import { App } from '@blockframes/utils/apps';
import { Offer } from '@blockframes/contract/offer/+state/offer.model';
import { Organization, OrganizationDocument } from '@blockframes/organization/+state';
import { Movie } from '@blockframes/movie/+state';
import { appUrl, supportEmails } from '@env';
import { staticModel } from '@blockframes/utils/static-model';
import { format } from "date-fns";
import { User } from '@blockframes/user/types';
import { createNotification, triggerNotifications } from './notification';
import { templateIds } from '@blockframes/utils/emails/ids';
import { Change } from 'firebase-functions';
import { createDocumentMeta } from './data/internals';

export async function onOfferCreate(snap: FirebaseFirestore.DocumentSnapshot): Promise<void> {
  const offer = snap.data() as Offer;
  const orgId = offer.buyerId;
  const [org, bucket] = await Promise.all([
    getDocument<OrganizationDocument>(`orgs/${orgId}`),
    getDocument<any>(`buckets/${orgId}`)
  ]);
  const user = await getDocument<User>(`users/${bucket.uid}`);

  // Empty bucket
  db.doc(`buckets/${orgId}`).update({ contracts: [], uid: null });

  bucket.currency = staticModel['movieCurrencies'][bucket.currency];
  for (const contract of bucket.contracts) {
    const movie = await getDocument<Movie>(`movies/${contract.titleId}`);
    contract['title'] = movie.title.international;

    for (const term of contract.terms) {
      term.exclusive = term.exclusive ? 'Yes' : 'No';
      term.medias = term.medias.map(media => staticModel['medias'][media]);
      term.territories = term.territories.map(territory => staticModel['territories'][territory]);
      term.duration.from = format(term.duration.from.toDate(), 'MM/dd/yyyy');
      term.duration.to = format(term.duration.to.toDate(), 'MM/dd/yyyy');
    }
  }

  // Send copy of offer to user who created the offer
  const notification = createNotification({
    toUserId: user.uid,
    type: 'offerCreatedConfirmation',
    docId: snap.id,
    bucket
  })
  triggerNotifications([notification])

  // Also send offer to admin of Cascade8
  const app: App = 'catalog';
  const baseUrl = appUrl['content'];
  const date = format(new Date(), 'dd MMMM, yyyy');
  const request: EmailTemplateRequest = {
    to: supportEmails[app],
    templateId: templateIds.offer.toAdmin,
    data: { org, bucket, user, baseUrl, date }
  }
  sendMailFromTemplate(request, app);
}


export async function onOfferUpdate(
  change: Change<FirebaseFirestore.DocumentSnapshot>
) {

  const before = change.before;
  const after = change.after;

  if (!before || !after) {
    throw new Error('Parameter "change" not found');
  }

  const offerBefore = before.data() as Offer;
  const offerAfter = after.data() as Offer;

  const statusHasChanged = offerBefore.status !== offerAfter.status
  const offerDeclinedOrAccepted = ['accepted', 'declined'].includes(offerAfter.status);
  if (statusHasChanged && offerDeclinedOrAccepted) {
    //Buyer Notifications.
    const getNotifications = (org: Organization) => org.userIds.map(userId => createNotification({
      toUserId: userId,
      type: offerAfter.status === 'accepted' ? 'offerAccepted' : 'offerDeclined',
      docId: offerAfter.id,
      _meta: createDocumentMeta({ createdFrom: 'catalog' })
    }));

    getDocument<Organization>(`orgs/${offerAfter.buyerId}`)
      .then(getNotifications)
      .then(triggerNotifications);
  }
}

