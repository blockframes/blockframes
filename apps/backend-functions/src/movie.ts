import { db } from './internals/firebase';
import { MovieDocument, OrganizationDocument, PublicUser, StoreConfig } from './data/types';
import { triggerNotifications, createNotification } from './notification';
import { getDocument, getOrganizationsOfMovie } from './data/internals';
import { removeAllSubcollections } from './utils';

import { centralOrgID } from './environments/environment';
import { orgName } from '@blockframes/organization/+state/organization.firestore';
import { cleanMovieMedias } from './media';
import { Change, EventContext } from 'firebase-functions';
import { algolia, deleteObject, storeSearchableMovie, storeSearchableOrg } from '@blockframes/firebase-utils';

/** Function triggered when a document is added into movies collection. */
export async function onMovieCreate(
  snap: FirebaseFirestore.DocumentSnapshot
) {
  const movie = snap.data() as MovieDocument;

  if (!movie) {
    console.error('Invalid movie data:', movie);
    throw new Error('movie update function got invalid movie data');
  }

  const user = await getDocument<PublicUser>(`users/${movie._meta!.createdBy}`);
  const organization = await getDocument<OrganizationDocument>(`orgs/${user.orgId}`);

  if (movie.storeConfig.status === 'accepted') {
    organization['hasAcceptedMovies'] = true;
    storeSearchableOrg(organization)
  }

  // Update algolia's index
  return storeSearchableMovie(movie, orgName(organization));
}

/** Remove a movie and send notifications to all users of concerned organizations. */
export async function onMovieDelete(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: EventContext
) {
  const movie = snap.data() as MovieDocument;

  await cleanMovieMedias(movie);

  const batch = db.batch();

  // Clean wishlists
  const wishlists = await db.collection('orgs').where('wishlist', 'array-contains', movie.id).get();
  wishlists.docs.forEach(d => batch.delete(d.ref));

  // Delete events
  const events = await db.collection('events').where('meta.titleId', '==', movie.id).get();
  events.docs.forEach(d => batch.delete(d.ref));

  // Delete invitations
  const eventIds = events.docs.map(e => e.id);
  if (eventIds.length) {
    const chunk = 10; // max 10 items in "in" queries
    let i, j, temparray;
    for (i = 0, j = eventIds.length; i < j; i += chunk) {
      temparray = eventIds.slice(i, i + chunk);
      const invitations = await db.collection('invitations').where('docId', 'in', temparray).get();
      invitations.docs.forEach(d => batch.delete(d.ref));
    }
  }

  // Delete sub-collections (distribution rights)
  await removeAllSubcollections(snap, batch);

  // Delete permissions
  const orgs = await db.collection('orgs').where('id', 'in', movie.orgIds).get();
  const permissionsPromises = orgs.docs.map(async o => db.doc(`permissions/${o.id}/documentPermissions/${movie.id}`).get());
  const permissions = await Promise.all(permissionsPromises);
  permissions.forEach(d => batch.delete(d.ref));

  // Update contracts
  const contracts = await db.collection('contracts').where('titleIds', 'array-contains', movie.id).get();
  contracts.docs.forEach(c => {
    const contract = c.data();
    if (!!contract.lastVersion?.titles[movie.id]) {
      delete contract.lastVersion.titles[movie.id];
    }
    batch.update(c.ref, contract);
  });

  // Update algolia's index
  const movieAppAccess = Object.keys(movie.storeConfig.appAccess).filter(access => movie.storeConfig.appAccess[access]);
  const promises = movieAppAccess.map(appName => deleteObject(algolia.indexNameMovies[appName], context.params.movieId));

  await Promise.all(promises)

  console.log(`Movie ${movie.id} removed`);
  return batch.commit();
}

export async function onMovieUpdate(
  change: Change<FirebaseFirestore.DocumentSnapshot>
): Promise<any> {
  const before = change.before.data() as MovieDocument;
  const after = change.after.data() as MovieDocument;
  if (!after) { return; }

  await cleanMovieMedias(before, after);

  const isMovieSubmitted = isSubmitted(before.storeConfig, after.storeConfig);
  const isMovieAccepted = isAccepted(before.storeConfig, after.storeConfig);

  if (isMovieSubmitted) { // When movie is submitted to Archipel Content
    const archipelContent = await getDocument<OrganizationDocument>(`orgs/${centralOrgID}`);
    const notifications = archipelContent.userIds.map(
      toUserId => createNotification({
        toUserId,
        type: 'movieSubmitted',
        docId: after.id
      })
    );

    await triggerNotifications(notifications);
  }

  if (isMovieAccepted) { // When Archipel Content accept the movie
    const organizations = await getOrganizationsOfMovie(after.id);
    const notifications = organizations
      .filter(organizationDocument => !!organizationDocument && !!organizationDocument.userIds)
      .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
      .map(toUserId => {
        return createNotification({
          toUserId,
          type: 'movieAccepted',
          docId: after.id
        });
      });

    await triggerNotifications(notifications);
  }

  // insert orgName & orgID to the algolia movie index (this is needed in order to filter on the frontend)
  const creator = await getDocument<PublicUser>(`users/${after._meta!.createdBy}`);
  const creatorOrg = await getDocument<OrganizationDocument>(`orgs/${creator!.orgId}`);

  if (creatorOrg.denomination?.full) {
    if (after.storeConfig.status !== before.storeConfig.status && after.storeConfig.status === 'accepted') {
      creatorOrg['hasAcceptedMovies'] = true;
      storeSearchableOrg(creatorOrg)
    }
    await storeSearchableMovie(after, orgName(creatorOrg));
    for (const app in after.storeConfig.appAccess) {
      if (after.storeConfig.appAccess[app] === false && before.storeConfig.appAccess[app] !== after.storeConfig.appAccess[app]) {
        await deleteObject(algolia.indexNameMovies[app], before.id);
      }
    }
  }
}

/** Checks if the store status is going from draft to submitted. */
function isSubmitted(beforeStore: StoreConfig | undefined, afterStore: StoreConfig | undefined) {
  return (
    (beforeStore && beforeStore.status === 'draft') &&
    (afterStore && afterStore.status === 'submitted')
  )
}

/** Checks if the store status is going from submitted to accepted. */
function isAccepted(beforeStore: StoreConfig | undefined, afterStore: StoreConfig | undefined) {

  // in catalog `draft` -> `submitted` -> `accepted`
  const acceptedInCatalog =
    (beforeStore && beforeStore.status === 'submitted') &&
    (afterStore && afterStore.status === 'accepted');

  // in festival `draft` -> `accepted`
  const acceptedInFestival =
    (beforeStore && beforeStore.status === 'draft') &&
    (afterStore && afterStore.status === 'accepted');

  return acceptedInCatalog || acceptedInFestival;
}
