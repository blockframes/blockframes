import { db } from './internals/firebase';
import { getDocument } from '@blockframes/firebase-utils';
import { EmailTemplateRequest, sendMailFromTemplate } from './internals/email';
import { App } from '@blockframes/utils/apps';
import { Offer } from '@blockframes/contract/offer/+state/offer.model';
import { OrganizationDocument } from '@blockframes/organization/+state';
import { Movie } from '@blockframes/movie/+state';
import { appUrl, supportEmails } from '@env';
import { staticModel } from '@blockframes/utils/static-model';
import { format } from "date-fns";
import { User } from '@blockframes/user/types';
import { createNotification, triggerNotifications } from './notification';
import { templateIds } from '@blockframes/utils/emails/ids';

export async function onOfferCreate(snap: FirebaseFirestore.DocumentSnapshot): Promise<void> {
  const offer = snap.data() as Offer;
  const orgId = offer.buyerId;
  const [ org, bucket ] = await Promise.all([
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
      term.duration.from = format(term.duration.from.toDate(), 'dd/MM/yyyy');
      term.duration.to = format(term.duration.to.toDate(), 'dd/MM/yyyy');
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
    templateId: templateIds.offer.created,
    data: { org, bucket, user, baseUrl, date }
  }
  sendMailFromTemplate(request, app);
}
