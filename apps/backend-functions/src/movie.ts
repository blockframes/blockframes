import { db } from './internals/firebase';
import { triggerNotifications } from './notification';
import { getOrganizationsOfMovie } from './data/internals';
import { cleanMovieMedias, moveMovieMedia } from './media';
import { EventContext } from 'firebase-functions';
import { algolia, deleteObject, storeSearchableMovie, storeSearchableOrg } from '@blockframes/firebase-utils/algolia';
import { getMailSender } from '@blockframes/utils/apps';
import { sendMovieSubmittedEmail } from './templates/mail';
import { sendMail } from './internals/email';
import { groupIds } from '@blockframes/utils/emails/ids';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import {
  Bucket,
  Movie,
  Organization,
  MovieAppConfig,
  PublicUser,
  createDocPermissions,
  App,
  getAllAppsExcept,
  getMovieAppAccess,
  createInternalDocumentMeta,
  createPublicUser,
  createNotification,
  wasLastAcceptedOn,
  wasLastSubmittedOn,
  getMoviePublishStatus,
  AlgoliaMovie,
  Mandate,
  Sale,
  Term,
  filterContractsByTitle,
  availableTitle,
  FullMandate,
  BackendSearchOptions
} from '@blockframes/model';
import { BlockframesChange, BlockframesSnapshot, getCollection, getDocument, queryDocuments } from '@blockframes/firebase-utils';
import algoliasearch, { SearchIndex } from 'algoliasearch';
import { centralOrgId } from '@env';

const apps: App[] = getAllAppsExcept(['crm']);

type AppConfigMap = Partial<{ [app in App]: MovieAppConfig }>;

/** Function triggered when a document is added into movies collection. */
export async function onMovieCreate(snap: BlockframesSnapshot<Movie>) {
  const movie = snap.data();

  if (!movie) {
    console.error('Invalid movie data:', movie);
    throw new Error('movie update function got invalid movie data');
  }

  const organizations = await getOrganizationsOfMovie(movie.id);
  for (const org of organizations) {
    await storeSearchableOrg(org);
  }
  const orgNames = organizations.map((org) => org.name).filter((orgName) => !!orgName);
  return storeSearchableMovie(movie, orgNames);
}

/** Remove a movie and send notifications to all users of concerned organizations. */
export async function onMovieDelete(snap: BlockframesSnapshot<Movie>, context: EventContext) {
  const movie = snap.data();

  await cleanMovieMedias(movie);

  const batch = db.batch();

  // Clean wishlists
  await removeMovieFromWishlists(movie, batch);

  await batch.commit();

  await db.runTransaction(async (tx) => {
    // Read events
    const events = await tx.get(db.collection('events').where('meta.titleId', '==', movie.id));

    // Read permissions
    const orgsPromises = movie.orgIds.map((o) => tx.get(db.collection('orgs').where('id', '==', o)));
    const _orgs = await Promise.all(orgsPromises);
    const orgIds: string[] = [];
    _orgs.forEach((s) => {
      s.docs.forEach((d) => orgIds.push(d.id));
    });
    const permissionsPromises = orgIds.map((orgId) => tx.get(db.doc(`permissions/${orgId}/documentPermissions/${movie.id}`)));
    const permissions = await Promise.all(permissionsPromises);

    // Read notifications
    const notifsCollectionRef = await tx.get(db.collection('notifications').where('docId', '==', movie.id));

    // Read contracts
    const contractsCollectionRef = await tx.get(db.collection('contracts').where('titleId', '==', movie.id));

    // Read buckets
    const bucketsCollectionRef = await tx.get(db.collection('buckets'));

    // Delete events
    events.docs.forEach((d) => tx.delete(d.ref));

    // Delete permissions
    permissions.forEach((p) => tx.delete(p.ref));

    // Delete notifications
    for (const doc of notifsCollectionRef.docs) {
      tx.delete(doc.ref);
    }

    // Delete contracts
    for (const doc of contractsCollectionRef.docs) {
      tx.delete(doc.ref);
    }

    // Update Buckets
    for (const doc of bucketsCollectionRef.docs) {
      const bucket = doc.data() as Bucket;

      if (bucket.contracts.some((c) => c.titleId === movie.id)) {
        bucket.contracts = bucket.contracts.filter((c) => c.titleId !== movie.id);
        tx.update(doc.ref, bucket);
      }
    }
  });

  // Update algolia's index
  const movieAppAccess = getMovieAppAccess(movie);
  const promises = movieAppAccess.map(
    (appName) => deleteObject(algolia.indexNameMovies[appName], context.params.movieId) as Promise<boolean>
  );

  await Promise.all(promises);

  console.log(`Movie ${movie.id} removed`);
}

export async function onMovieUpdate(change: BlockframesChange<Movie>) {
  const before = change.before.data();
  const after = change.after.data();
  if (!after) {
    return;
  }

  await cleanMovieMedias(before, after);
  await moveMovieMedia(before, after);

  const isMovieSubmitted = isSubmitted(before.app, after.app);
  const isMovieAccepted = isAccepted(before.app, after.app);

  const organizations = await getOrganizationsOfMovie(after.id);

  if (isMovieSubmitted) {
    const createdFrom = wasLastSubmittedOn(after);
    // Mail to supportEmails.[app]
    const from = getMailSender(createdFrom);
    await sendMail(sendMovieSubmittedEmail(createdFrom, after, organizations[0]), from, groupIds.noUnsubscribeLink);

    // Notification to users related to current movie
    const notifications = organizations
      .filter((organization) => !!organization?.userIds?.length)
      .reduce((ids: string[], org) => ids.concat(org.userIds), [])
      .map((toUserId) =>
        createNotification({
          toUserId,
          type: 'movieSubmitted',
          docId: after.id,
          _meta: createInternalDocumentMeta({ createdFrom }),
        })
      );

    await triggerNotifications(notifications);
  }

  if (isMovieAccepted) {
    // When Archipel Content accept the movie
    const notifications = organizations
      .filter((organization) => !!organization?.userIds?.length)
      .reduce((ids: string[], org) => ids.concat(org.userIds), [])
      .map((toUserId) => {
        return createNotification({
          toUserId,
          type: 'movieAccepted',
          docId: after.id,
          _meta: createInternalDocumentMeta({ createdFrom: wasLastAcceptedOn(after) }),
        });
      });

    await triggerNotifications(notifications);
  }

  // If movie was accepted but is not anymore, clean wishlists
  if (Object.keys(after.app).map((a) => before.app[a].status === 'accepted' && after.app[a].status !== before.app[a].status)) {
    await removeMovieFromWishlists(after);
  }

  // Change documentPermission docs based on orgIds change
  const addedOrgIds = after.orgIds.filter((id) => !before.orgIds.includes(id));
  const removedOrgIds = before.orgIds.filter((id) => !after.orgIds.includes(id));

  const addedPromises = addedOrgIds.map((orgId) => {
    const permissions = createDocPermissions({ id: after.id, ownerId: orgId });
    return db.doc(`permissions/${orgId}/documentPermissions/${after.id}`).set(permissions);
  });
  const removedPromises = removedOrgIds.map((orgId) => db.doc(`permissions/${orgId}/documentPermissions/${after.id}`).delete());
  await Promise.all([...addedPromises, ...removedPromises]);

  // insert orgName & orgID to the algolia movie index (this is needed in order to filter on the frontend)
  for (const org of organizations) {
    await storeSearchableOrg(org);
  }
  const orgNames = organizations.map((org) => org.name).filter((orgName) => !!orgName);
  await storeSearchableMovie(after, orgNames);

  for (const app in after.app) {
    if (after.app[app].access === false && before.app[app].access !== after.app[app].access) {
      await deleteObject(algolia.indexNameMovies[app], before.id);
    }
  }
}

export async function createAskingPriceRequest(
  data: { uid: string; movieId: string; territories: string; message: string },
  context: CallableContext
) {
  const { uid, movieId, territories, message } = data;

  if (!context?.auth) throw new Error('Permission denied: missing auth context.');
  if (!uid) throw new Error('User id is mandatory for requesting asking price');
  if (!movieId) throw new Error('Movie id is mandatory for requesting asking price');

  const [user, movie] = await Promise.all([getDocument<PublicUser>(`users/${uid}`), getDocument<Movie>(`movies/${movieId}`)]);

  const getNotifications = (org: Organization) =>
    org.userIds.map((userId) =>
      createNotification({
        toUserId: userId,
        type: 'movieAskingPriceRequested',
        docId: movieId,
        data: { territories, message },
        user: createPublicUser(user),
        _meta: createInternalDocumentMeta({ createdFrom: 'festival' }),
      })
    );

  for (const orgId of movie.orgIds) {
    getDocument<Organization>(`orgs/${orgId}`).then(getNotifications).then(triggerNotifications);
  }

  // Send notification to user who requested the asking price
  const notification = createNotification({
    toUserId: uid,
    type: 'movieAskingPriceRequestSent',
    docId: movieId,
    data: { territories, message },
    user: createPublicUser(user),
    _meta: createInternalDocumentMeta({ createdFrom: 'festival' }),
  });
  triggerNotifications([notification]);
}

/** Checks if the store status is going from draft to submitted. */
function isSubmitted(previousAppConfig: AppConfigMap, currentAppConfig: AppConfigMap) {
  return apps.some((app) => {
    return (
      previousAppConfig &&
      previousAppConfig[app].status === 'draft' &&
      currentAppConfig &&
      currentAppConfig[app].status === 'submitted' &&
      currentAppConfig[app].access === true
    );
  });
}

/** Checks if the store status is going from submitted to accepted. */
function isAccepted(previousAppConfig: AppConfigMap, currentAppConfig: AppConfigMap) {
  return apps.some((app) => {
    if (getMoviePublishStatus(app) === 'accepted') {
      // in festival `draft` -> `accepted`
      return (
        previousAppConfig &&
        previousAppConfig[app].status === 'draft' &&
        currentAppConfig &&
        currentAppConfig[app].status === 'accepted' &&
        currentAppConfig[app].access === true
      );
    }
    // in catalog/financiers `draft` -> `submitted` -> `accepted`
    return (
      previousAppConfig &&
      previousAppConfig[app].status === 'submitted' &&
      currentAppConfig &&
      currentAppConfig[app].status === 'accepted' &&
      currentAppConfig[app].access === true
    );
  });
}

async function removeMovieFromWishlists(movie: Movie, batch?: FirebaseFirestore.WriteBatch) {
  const collection = db.collection('orgs');
  const orgsWithWishlists = await collection.where('wishlist', 'array-contains', movie.id).get();
  const updates: Promise<FirebaseFirestore.WriteResult>[] = [];
  for (const o of orgsWithWishlists.docs) {
    const org = o.data();
    org.wishlist = org.wishlist.filter((movieId) => movieId !== movie.id);
    if (batch) {
      batch.update(o.ref, org);
    } else {
      const update = collection.doc(org.id).set({ wishlist: org.wishlist }, { merge: true });
      updates.push(update);
    }
  }
  if (updates.length) {
    await Promise.allSettled(updates);
  }
}

export async function algoliaSearch(
  data: BackendSearchOptions,
  context: CallableContext
) {
  const { orgId, availsFilter } = data;

  if (!context?.auth) throw new Error('Permission denied: missing auth context.');
  if (!orgId) throw new Error('Permission denied: missing org id.');

  const test = availsFilter ? await loadAvailsData2(orgId) : {};

  console.time('algoliaSearch')
  const [regularSearch, pdfSearch] = await Promise.all([
    _algoliaSearch({ ...data, maxHits: undefined }, test),
    _algoliaSearch(data, test) // TODO #8894 clean
  ]);
  console.timeEnd('algoliaSearch')
  return { ...regularSearch, moviesToExport: pdfSearch.hits };
}

async function loadAvailsData(orgId: string) {
  console.time('mandates')
  // LOAD CONTRACTS RELATED DATA
  const mandatesQuery = db.collection('contracts')
    .where('type', '==', 'mandate')
    .where('buyerId', '==', centralOrgId.catalog)
    .where('status', '==', 'accepted');
  const mandates = await queryDocuments<Mandate>(mandatesQuery);
  console.timeEnd('mandates')

  // No accepted mandates in DB
  if (!mandates.length) return;
  console.time('sales')
  const salesQuery = db.collection('contracts')
    .where('type', '==', 'sale')
    .where('status', '==', 'accepted');
  const sales = await queryDocuments<Sale>(salesQuery);
  console.timeEnd('sales')

  console.time('terms')
  const _terms = await getCollection<Term>('terms');
  const terms = _terms.map(t => {
    /**
     * @see https://github.com/firebase/firebase-functions/issues/316
     * convert dates to timestamp
     */
    // TODO #8894 clean type
    if (t.duration?.from) (t.duration as any).from = t.duration.from.getTime();
    if (t.duration?.to) (t.duration as any).to = t.duration.to.getTime()
    return t;
  })


  const mandateTermIds = mandates.map(mandate => mandate.termIds).flat();
  const mandateTerms = terms.filter(t => mandateTermIds.includes(t.id));

  const saleTermIds = sales.map(sale => sale.termIds).flat();
  const saleTerms = terms.filter(t => saleTermIds.includes(t.id));
  console.timeEnd('terms')

  console.time('buckets')
  const bucket = await getDocument<Bucket>(`buckets/${orgId}`);
  console.timeEnd('buckets')
  return {
    mandates,
    mandateTerms,
    sales,
    saleTerms,
    bucket
  }
}

async function loadAvailsData2(orgId: string) {
  console.time('loadAvailsData2')
  const promises = [];

  // LOAD CONTRACTS RELATED DATA
  const mandatesQuery = db.collection('contracts')
    .where('type', '==', 'mandate')
    .where('buyerId', '==', centralOrgId.catalog)
    .where('status', '==', 'accepted');
  promises.push(queryDocuments<Mandate>(mandatesQuery));

  const salesQuery = db.collection('contracts')
    .where('type', '==', 'sale')
    .where('status', '==', 'accepted');
  promises.push(queryDocuments<Sale>(salesQuery));

  promises.push(getCollection<Term>('terms'));

  promises.push(getDocument<Bucket>(`buckets/${orgId}`));

  const [mandates, sales, _terms, bucket] = await Promise.all(promises);
  const terms = _terms.map(t => {
    /**
     * @see https://github.com/firebase/firebase-functions/issues/316
     * convert dates to timestamp
     */
    // TODO #8894 clean type
    if (t.duration?.from) (t.duration as any).from = t.duration.from.getTime();
    if (t.duration?.to) (t.duration as any).to = t.duration.to.getTime()
    return t;
  });

  const mandateTermIds = mandates.map(mandate => mandate.termIds).flat();
  const mandateTerms = terms.filter(t => mandateTermIds.includes(t.id));

  const saleTermIds = sales.map(sale => sale.termIds).flat();
  const saleTerms = terms.filter(t => saleTermIds.includes(t.id));
  console.timeEnd('loadAvailsData2')
  return {
    mandates,
    mandateTerms,
    sales,
    saleTerms,
    bucket
  }
}

let testBruce ;

async function _algoliaSearch(
  { app, search, availsFilter, maxHits, cachedAvails }: BackendSearchOptions,
  { mandates, mandateTerms, sales, saleTerms, bucket }: any // TODO #8894 type
) {
  if(!testBruce) testBruce = Math.random().toString(36).substr(2);
  console.log(testBruce);
  const movieIndex: SearchIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algolia.indexNameMovies[app]);

  // SEARCH WITHOUT AVAIL FILTERS (Regular algolia search)
  // (if availsForm is invalid, put all the movies from algolia)
  if (!availsFilter) {
    const overridedSearch = { ...search };
    if (maxHits) {
      overridedSearch.hitsPerPage = maxHits
      overridedSearch.page = 0;
    }
    const movies = await movieIndex.search<AlgoliaMovie>(overridedSearch.query, overridedSearch);
    const hits = movies.hits.map(m => ({ ...m, mandates: [] as FullMandate[] }));
    return { nbHits: movies.nbHits, hits };
  }

  // ALGOLIA SEARCH WITHOUT PAGINATION
  const overridedSearch = { ...search };
  overridedSearch.hitsPerPage = 1000; // Max is 1000, see docs: https://www.algolia.com/doc/api-reference/api-parameters/hitsPerPage/
  overridedSearch.page = 0;

  const movies = await movieIndex.search<AlgoliaMovie>(overridedSearch.query, overridedSearch);
  let hitsRetrieved: number = movies.hits.length;
  const maxLoop = 10; // Security to prevent infinite loop
  let loops = 0;
  while (movies.nbHits > hitsRetrieved) {
    loops++;
    overridedSearch.page++;
    const m = await movieIndex.search<AlgoliaMovie>(overridedSearch.query, overridedSearch);
    movies.hits = movies.hits.concat(m.hits);
    hitsRetrieved = movies.hits.length;
    if (loops >= maxLoop) break
  }

  // No accepted mandates in DB
  if (!mandates.length) return { nbHits: 0, hits: [] };

  // @see https://github.com/firebase/firebase-functions/issues/316
  availsFilter.duration.from = new Date(availsFilter.duration.from);
  availsFilter.duration.to = new Date(availsFilter.duration.to);

  // Filtered algolia results with avails
  console.log(cachedAvails);
  const allHits = movies.hits.map(movie => {
    const res = filterContractsByTitle(movie.objectID, mandates, mandateTerms, sales, saleTerms, bucket);
    const availableMandates = availableTitle(availsFilter, res.mandates, res.sales, res.bucketContracts);
    return { ...movie, mandates: availableMandates }; // TODO slice ici et save des movieID précédents
  }).filter(m => !!m.mandates.length);

  const hits = maxHits ? allHits.slice(0, maxHits) : allHits.slice(search.page * search.hitsPerPage, (search.page * search.hitsPerPage) + search.hitsPerPage);
  return { nbHits: allHits.length, hits };
}
