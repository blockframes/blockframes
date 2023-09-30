import { getCollection, queryDocument, queryDocuments } from '@blockframes/firebase-utils';
import { Request, Response } from 'firebase-functions';
import { db } from './internals/firebase';
import { baseId } from '@env';
import * as bigQuery from './bigQuery';
import {
  updateAirtableOrgAnalytics,
  updateAirtableSearchAnalytics,
  updateAirtableTitleAnalytics,
  updateAirtableUsers,
} from './users';
import { updateAirtableOrgs } from './orgs';
import { updateAirtableMovieAnalytics, updateAirtableMovies } from './movie';
import { updateAirtableEvents } from './event';
import { updateAirtableContracts } from './contracts';
import { updateAirtableOffers } from './offer';
import { updateAirtableBuckets } from './buckets';
import {
  Analytics,
  Bucket,
  Event,
  Organization,
  User,
  Permissions,
  Movie,
  isScreening,
  isMandate,
  Contract,
  Invitation,
  isSale,
  Income,
  Negotiation,
  Offer,
  EventName,
} from '@blockframes/model';

export const updateAirtable = async (req: Request, res: Response) => {
  if (!baseId) return;
  res.set('Access-Control-Allow-Origin', '*');

  const searchAnalyticsEventNames: EventName[] = [
    'filteredTitles',
    'savedFilters',
    'loadedFilters',
    'exportedTitles',
    'filteredAvailsCalendar',
    'filteredAvailsMap',
  ];

  const buckets = await getCollection<Bucket>('buckets');
  const events = await getCollection<Event>('events');
  const incomes = await getCollection<Income>('incomes');
  const invites = await queryDocuments<Invitation>(db.collection('invitations').where('type', '==', 'attendEvent'));
  const mandates = (await queryDocuments<Contract>(db.collection('contracts').where('type', '==', 'mandate'))).filter(isMandate);
  const movies = await getCollection<Movie>('movies');
  const offers = await queryDocuments<Offer>(db.collection('offers').orderBy('_meta.createdAt', 'desc'));
  const offerContracts = await queryDocuments<Contract>(db.collection('contracts').where('offerId', '!=', ''));
  const orgs = await getCollection<Organization>('orgs');
  const permissions = await getCollection<Permissions>('permissions');
  const sales = (await queryDocuments<Contract>(db.collection('contracts').where('type', '==', 'sale'))).filter(isSale);
  const screenings = (await queryDocuments<Event>(db.collection('events').where('type', '==', 'screening'))).filter(isScreening);
  const users = await getCollection<User>('users');

  const availsSearchAnalytics = await queryDocuments<Analytics<'titleSearch'>>(
    db
      .collection('analytics')
      .where('type', '==', 'titleSearch')
      .where('name', 'in', ['filteredAvailsCalendar', 'filteredAvailsMap'])
  );
  const orgAnalytics = await queryDocuments<Analytics<'organization'>>(
    db.collection('analytics').where('type', '==', 'organization').where('name', '==', 'orgPageView')
  );
  const searchAnalytics = await queryDocuments<Analytics<'titleSearch'>>(
    db.collection('analytics').where('name', 'in', searchAnalyticsEventNames)
  );
  const titleViewAnalytics = await queryDocuments<Analytics<'title'>>(
    db.collection('analytics').where('type', '==', 'title').where('name', '==', 'pageView')
  );
  const titleAnalytics = await queryDocuments<Analytics<'title'>>(db.collection('analytics').where('type', '==', 'title'));
  const titleSearchAnalytics = await queryDocuments<Analytics<'titleSearch'>>(
    db.collection('analytics').where('type', '==', 'titleSearch')
  );
  const userAnalytics = await bigQuery._getAnalyticsActiveUsers();

  const lastNegotiationsPromises: Promise<Negotiation & { contractId: string }>[] = sales.map(s =>
    queryDocument<Negotiation>(db.collection(`contracts/${s.id}/negotiations`).orderBy('_meta.createdAt', 'desc'))
      .catch(_ => undefined)
      .then(nego => ({ ...nego, contractId: s.id }))
  );
  const lastNegotiations = (await Promise.all(lastNegotiationsPromises)).filter(n => !!n && n.id);

  // Promise.all takes half the time, but keeping it sequential ensures a better log readability
  await updateAirtableUsers({ users, orgs, permissions, userAnalytics, titleViewAnalytics, orgAnalytics, titleSearchAnalytics });
  await updateAirtableOrgs(orgs);
  await updateAirtableMovies({ movies, orgs, screenings, mandates });
  await updateAirtableEvents({ events, orgs, invites });
  await updateAirtableContracts({ mandates, sales, orgs, movies, incomes, lastNegotiations });
  await updateAirtableOffers({ offers, offerContracts, movies, lastNegotiations });
  await updateAirtableBuckets(buckets, orgs);
  await updateAirtableTitleAnalytics({ users, orgs, userAnalytics, titleAnalytics, availsSearchAnalytics });
  await updateAirtableOrgAnalytics({ orgAnalytics, orgs });
  await updateAirtableSearchAnalytics({ users, orgs, userAnalytics, searchAnalytics });
  await updateAirtableMovieAnalytics({ movies, orgs, screenings, mandates, titleAnalytics, availsSearchAnalytics });

  res.status(200).send('Airtable is up to date.');
};
