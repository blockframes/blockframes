import { getCollection, queryDocument, queryDocuments, getDb } from '@blockframes/firebase-utils';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { airtable } from './environments/environment';
import * as bigQuery from './bigQuery';
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
  bucketsToCrmBuckets,
  crmBucketsToExport,
  usersToCrmUsers,
  filterOwnerEvents,
  crmUsersToExport,
  orgsToExport,
  ScreeningEvent,
  Mandate,
  moviesToCrmMovies,
  crmMoviesToExport,
  eventsToCrmEvents,
  crmEventsToExport,
  Sale,
  contractToDetailedContract,
  mandatesToExport,
  salesToExport,
  offersToCrmOffers,
  crmOffersToExport,
  titleAnalyticsToExport,
  orgAnalyticsToExport,
  searchAnalyticsToExport,
  movieAnalyticsToExport,
} from '@blockframes/model';
import { AirtableService } from './internals/airtable.service';

const airtableService = new AirtableService();

export const synchronizeAirtable = async (_, context: CallableContext) => {
  const db = getDb();
  if (!context?.auth) throw new Error('Permission denied: missing auth context.');
  const bfadmin = await db.doc(`blockframesAdmin/${context.auth.uid}`).get();
  if (!bfadmin.exists) throw new Error('Permission denied: you are not blockframes admin.');
  return updateAirtable();
}

export const scheduledAirtable = async () => {
  if (!airtable.dailyUpdate) {
    console.log('Airtable daily update is not enabled in environment.');
    return;
  }

  return updateAirtable();
}

const updateAirtable = async () => {
  const db = getDb();
  if (!airtable.baseId) throw new Error('Required baseId is not set in environment.');

  const searchAnalyticsEventNames: EventName[] = [
    'filteredTitles',
    'savedFilters',
    'loadedFilters',
    'exportedTitles',
    'filteredAvailsCalendar',
    'filteredAvailsMap',
  ];

  const availsSearchAnalyticsQuery = db.collection('analytics').where('type', '==', 'titleSearch').where('name', 'in', ['filteredAvailsCalendar', 'filteredAvailsMap']);
  const orgAnalyticsQuery = db.collection('analytics').where('type', '==', 'organization').where('name', '==', 'orgPageView');
  const searchAnalyticsQuery = db.collection('analytics').where('name', 'in', searchAnalyticsEventNames);
  const titleAnalyticsQuery = db.collection('analytics').where('type', '==', 'title');
  const titleSearchAnalyticsQuery = db.collection('analytics').where('type', '==', 'titleSearch');

  const [
    buckets,
    events,
    incomes,
    invites,
    contracts,
    movies,
    offers,
    orgs,
    permissions,
    users,
    availsSearchAnalytics,
    orgAnalytics,
    searchAnalytics,
    titleAnalytics,
    titleSearchAnalytics,
    userAnalytics
  ] = await Promise.all([
    getCollection<Bucket>('buckets'),
    getCollection<Event>('events'),
    getCollection<Income>('incomes'),
    queryDocuments<Invitation>(db.collection('invitations').where('type', '==', 'attendEvent')),
    queryDocuments<Contract>(db.collection('contracts')),
    getCollection<Movie>('movies'),
    queryDocuments<Offer>(db.collection('offers').orderBy('_meta.createdAt', 'desc')),
    getCollection<Organization>('orgs'),
    getCollection<Permissions>('permissions'),
    getCollection<User>('users'),
    queryDocuments<Analytics<'titleSearch'>>(availsSearchAnalyticsQuery),
    queryDocuments<Analytics<'organization'>>(orgAnalyticsQuery),
    queryDocuments<Analytics<'titleSearch'>>(searchAnalyticsQuery),
    queryDocuments<Analytics<'title'>>(titleAnalyticsQuery),
    queryDocuments<Analytics<'titleSearch'>>(titleSearchAnalyticsQuery),
    bigQuery._getAnalyticsActiveUsers()
  ])

  const mandates = contracts.filter(isMandate);
  const sales = contracts.filter(isSale);
  const offerContracts = contracts.filter(c => !!c.offerId);
  const screenings = events.filter(isScreening);
  const titleViewAnalytics = titleAnalytics.filter(a => a.name === 'pageView');

  const lastNegotiationsPromises: Promise<Negotiation & { contractId: string }>[] = sales.map(s =>
    queryDocument<Negotiation>(db.collection(`contracts/${s.id}/negotiations`).orderBy('_meta.createdAt', 'desc'))
      .catch(_ => undefined)
      .then(nego => ({ ...nego, contractId: s.id }))
  );
  const lastNegotiations = (await Promise.all(lastNegotiationsPromises)).filter(n => !!n && n.id);

  const promises = [
    updateAirtableUsers({ users, orgs, permissions, userAnalytics, titleViewAnalytics, orgAnalytics, titleSearchAnalytics }),
    updateAirtableOrgs(orgs),
    updateAirtableMovies({ movies, orgs, screenings, mandates }),
    updateAirtableEvents({ events, orgs, invites }),
    updateAirtableContracts({ mandates, sales, orgs, movies, incomes, lastNegotiations }),
    updateAirtableOffers({ offers, offerContracts, movies, lastNegotiations }),
    updateAirtableBuckets(buckets, orgs),
    updateAirtableTitleAnalytics({ movies, users, orgs, userAnalytics, titleAnalytics, availsSearchAnalytics }),
    updateAirtableOrgAnalytics({ orgAnalytics, orgs }),
    updateAirtableSearchAnalytics({ movies, users, orgs, userAnalytics, searchAnalytics }),
    updateAirtableMovieAnalytics({ users, movies, orgs, screenings, mandates, titleAnalytics, availsSearchAnalytics })
  ];

  await Promise.all(promises);
  return 'Airtable is up to date.';
};

async function updateAirtableUsers({
  users,
  orgs,
  permissions,
  userAnalytics,
  titleViewAnalytics,
  orgAnalytics,
  titleSearchAnalytics,
}: {
  users: User[];
  orgs: Organization[];
  permissions: Permissions[];
  userAnalytics: any[];
  titleViewAnalytics: Analytics<'title'>[];
  orgAnalytics: Analytics<'organization'>[];
  titleSearchAnalytics: Analytics<'titleSearch'>[];
}) {
  console.log('===== Updating users =====');

  const crmUsers = usersToCrmUsers(users, orgs, userAnalytics);
  const allAnalytics = filterOwnerEvents([...titleViewAnalytics, ...orgAnalytics, ...titleSearchAnalytics]);

  const rows = crmUsersToExport(crmUsers, allAnalytics, permissions, 'airtable');

  const synchronization = await airtableService.synchronize(airtable.tables.users, rows, 'userId');
  console.log(synchronization);
}

async function updateAirtableOrgs(orgs: Organization[]) {
  console.log('===== Updating orgs =====');

  const rows = orgsToExport(orgs, 'airtable');

  const synchronization = await airtableService.synchronize(airtable.tables.orgs, rows, 'id');
  console.log(synchronization);
}

async function updateAirtableMovies({
  movies,
  orgs,
  screenings,
  mandates,
}: {
  movies: Movie[];
  orgs: Organization[];
  screenings: ScreeningEvent[];
  mandates: Mandate[];
}) {
  console.log('===== Updating titles =====');

  const CrmMovies = moviesToCrmMovies(movies, orgs, screenings, mandates);

  const rows = crmMoviesToExport(CrmMovies, 'airtable');

  const synchronization = await airtableService.synchronize(airtable.tables.titles, rows, 'movie id');
  console.log(synchronization);
}

async function updateAirtableEvents({
  events,
  orgs,
  invites,
}: {
  events: Event[];
  orgs: Organization[];
  invites: Invitation[];
}) {
  console.log('===== Updating events =====');

  const crmEvents = eventsToCrmEvents(events, orgs, invites);

  const rows = crmEventsToExport(crmEvents);

  const synchronization = await airtableService.synchronize(airtable.tables.events, rows, 'event id');
  console.log(synchronization);
}

async function updateAirtableContracts({
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

  const synchronization = await airtableService.synchronize(airtable.tables.contracts, rows, 'id');
  console.log(synchronization);
}

async function updateAirtableOffers({
  offers,
  offerContracts,
  movies,
  lastNegotiations,
}: {
  offers: Offer[];
  offerContracts: Contract[];
  movies: Movie[];
  lastNegotiations: (Negotiation & { contractId: string })[];
}) {
  console.log('===== Updating offers =====');

  const crmOffers = offersToCrmOffers(offers, offerContracts, movies, lastNegotiations);

  const rows = crmOffersToExport(crmOffers, 'airtable');

  const synchronization = await airtableService.synchronize(airtable.tables.offers, rows, 'reference');
  console.log(synchronization);
}

async function updateAirtableBuckets(buckets: Bucket[], orgs: Organization[]) {
  console.log('===== Updating buckets =====');

  const crmBuckets = bucketsToCrmBuckets(buckets, orgs);

  const rows = crmBucketsToExport(crmBuckets, 'airtable');

  const synchronization = await airtableService.synchronize(airtable.tables.buckets, rows, 'bucket reference');
  console.log(synchronization);
}

async function updateAirtableTitleAnalytics({
  users,
  orgs,
  movies,
  userAnalytics,
  titleAnalytics,
  availsSearchAnalytics,
}: {
  users: User[];
  orgs: Organization[];
  movies: Movie[];
  userAnalytics: any[];
  titleAnalytics: Analytics<'title'>[];
  availsSearchAnalytics: Analytics<'titleSearch'>[];
}) {
  console.log('===== Updating title analytics =====');

  const allAnalytics = filterOwnerEvents([...titleAnalytics, ...availsSearchAnalytics]);
  const allTitleIds = Array.from(new Set(allAnalytics.map(analytic => analytic.meta.titleId).filter(t => !!t)));
  const allTitles = allTitleIds.map(titleId => movies.find(movie => movie.id === titleId)).filter(m => !!m);

  const crmUsers = usersToCrmUsers(users, orgs, userAnalytics);

  const rows = titleAnalyticsToExport(crmUsers, allAnalytics, allTitles, allTitleIds, orgs, 'airtable');

  const synchronization = await airtableService.synchronize(airtable.tables.titleAnalytics, rows, ['uid', 'titleId']);
  console.log(synchronization);
}

async function updateAirtableOrgAnalytics({
  orgAnalytics,
  orgs,
}: {
  orgAnalytics: Analytics<'organization'>[];
  orgs: Organization[];
}) {
  console.log('===== Updating org analytics =====');

  const rows = orgAnalyticsToExport(orgAnalytics, orgs);

  const synchronization = await airtableService.synchronize(airtable.tables.orgAnalytics, rows, ['uid', 'visited org id', 'date']);
  console.log(synchronization);
}

async function updateAirtableSearchAnalytics({
  users,
  orgs,
  movies,
  userAnalytics,
  searchAnalytics,
}: {
  users: User[];
  orgs: Organization[];
  movies: Movie[];
  userAnalytics: any[];
  searchAnalytics: Analytics<'titleSearch'>[];
}) {
  console.log('===== Updating search analytics =====');

  const allTitleIds = Array.from(new Set(searchAnalytics.map(analytic => analytic.meta.titleId).filter(t => !!t)));
  const allTitles = allTitleIds.map(titleId => movies.find(movie => movie.id === titleId)).filter(m => !!m);
  const crmUsers = usersToCrmUsers(users, orgs, userAnalytics);

  const rows = searchAnalyticsToExport(searchAnalytics, crmUsers, orgs, allTitles, 'airtable');

  const synchronization = await airtableService.synchronize(airtable.tables.searchAnalytics, rows, ['uid', 'date']);
  console.log(synchronization);
}

async function updateAirtableMovieAnalytics({
  users,
  movies,
  orgs,
  screenings,
  mandates,
  titleAnalytics,
  availsSearchAnalytics,
}: {
  users: User[];
  movies: Movie[];
  orgs: Organization[];
  screenings: ScreeningEvent[];
  mandates: Mandate[];
  titleAnalytics: Analytics<'title'>[];
  availsSearchAnalytics: Analytics<'titleSearch'>[];
}) {
  console.log('===== Updating movie analytics =====');

  const allAnalytics = filterOwnerEvents([...titleAnalytics, ...availsSearchAnalytics]);
  const crmMovies = moviesToCrmMovies(movies, orgs, screenings, mandates);

  const allUids = Array.from(new Set(allAnalytics.map(analytic => analytic.meta.uid)));
  const allUsers = allUids.map(uid => users.find(u => u.uid === uid)).filter(u => !!u);

  const rows = movieAnalyticsToExport(crmMovies, allAnalytics, allUids, allUsers, orgs, 'airtable');

  const catalogRows = rows.filter(r => r['interactions on catalog']);

  const synchronization = await airtableService.synchronize(airtable.tables.movieAnalytics, catalogRows, ['title id', 'uid']);
  console.log(synchronization);
}