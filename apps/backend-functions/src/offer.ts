import { db } from './internals/firebase';
import { getDocument } from '@blockframes/firebase-utils';
import { EmailTemplateRequest, sendMailFromTemplate } from './internals/email';
import { App } from '@blockframes/utils/apps';
import { Offer } from '@blockframes/contract/offer/+state/offer.model';
import { OrganizationDocument } from '@blockframes/organization/+state';
import { Movie } from '@blockframes/movie/+state';
import { supportEmails } from '@env';
import { staticModel } from '@blockframes/utils/static-model';
import { format } from "date-fns";


export async function onOfferCreate(snap: FirebaseFirestore.DocumentSnapshot): Promise<void> {
  const offer = snap.data() as Offer;
  const orgId = offer.buyerId;
  const [ org, bucket ] = await Promise.all([
    getDocument<OrganizationDocument>(`orgs/${orgId}`),
    getDocument<any>(`buckets/${orgId}`)
  ]);

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

  const app: App = 'catalog';
  const request: EmailTemplateRequest = {
    to: supportEmails[app],
    templateId: 'd-94a20b20085842f68fb2d64fe325638a',
    data: { org, bucket }
  }
  sendMailFromTemplate(request, app);

  // Empty bucket
  db.doc(`buckets/${orgId}`).update({ contracts: [] });
}