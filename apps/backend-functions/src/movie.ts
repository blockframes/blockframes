import { db } from './internals/firebase';
import { MovieDocument, createDocPermissions, PublicUser } from './data/types';
import { triggerNotifications, createNotification } from './notification';
import { createDocumentMeta, createPublicUserDocument, getOrganizationsOfMovie, Timestamp } from './data/internals';

import { orgName } from '@blockframes/organization/+state/organization.firestore';
import { MovieAppConfig } from '@blockframes/movie/+state/movie.firestore';
import { cleanMovieMedias, moveMovieMedia } from './media';
import { Change, EventContext } from 'firebase-functions';
import { algolia, deleteObject, getDocument, storeSearchableMovie, storeSearchableOrg } from '@blockframes/firebase-utils';
import { App, getAllAppsExcept, getMovieAppAccess, getMailSender } from '@blockframes/utils/apps';
import { Bucket } from '@blockframes/contract/bucket/+state/bucket.model';
import { sendMovieSubmittedEmail } from './templates/mail';
import { sendMail } from './internals/email';
import { groupIds } from '@blockframes/utils/emails/ids';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { Movie } from '@blockframes/movie/+state';
import { Organization } from '@blockframes/organization/+state';

const apps: App[] = getAllAppsExcept(['crm']);

type AppConfigMap = Partial<{ [app in App]: MovieAppConfig<Timestamp> }>;

/** Function triggered when a document is added into movies collection. */
export async function onMovieCreate(
  snap: FirebaseFirestore.DocumentSnapshot
) {
  const movie = snap.data() as MovieDocument;

  if (!movie) {
    console.error('Invalid movie data:', movie);
    throw new Error('movie update function got invalid movie data');
  }

  const organizations = await getOrganizationsOfMovie(movie.id);
  for (const org of organizations) {
    await storeSearchableOrg(org);
  }
  const orgNames = organizations.map(org => orgName(org)).filter(orgName => !!orgName);
  return storeSearchableMovie(movie, orgNames);
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
  await removeMovieFromWishlists(movie, batch);

  await batch.commit();

  await db.runTransaction(async tx => {
    // Read events
    const events = await tx.get(db.collection('events').where('meta.titleId', '==', movie.id));

    // Read permissions
    const orgsPromises = movie.orgIds.map(o => tx.get(db.collection('orgs').where('id', '==', o)));
    const _orgs = await Promise.all(orgsPromises);
    const orgIds: string[] = [];
    _orgs.forEach(s => { s.docs.forEach(d => orgIds.push(d.id)) });
    const permissionsPromises = orgIds.map(orgId => tx.get(db.doc(`permissions/${orgId}/documentPermissions/${movie.id}`)));
    const permissions = await Promise.all(permissionsPromises);

    // Read notifications
    const notifsCollectionRef = await tx.get(db.collection('notifications').where('docId', '==', movie.id));

    // Read contracts
    const contractsCollectionRef = await tx.get(db.collection('contracts').where('titleId', '==', movie.id));

    // Read buckets 
    const bucketsCollectionRef = await tx.get(db.collection('buckets'));

    // Delete events
    events.docs.forEach(d => tx.delete(d.ref));

    // Delete permissions
    permissions.forEach(p => tx.delete(p.ref));

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

      if (bucket.contracts.some(c => c.titleId === movie.id)) {
        bucket.contracts = bucket.contracts.filter(c => c.titleId !== movie.id);
        tx.update(doc.ref, bucket);
      }
    }

  });

  // Update algolia's index
  const movieAppAccess = getMovieAppAccess(movie);
  const promises = movieAppAccess.map(appName => deleteObject(algolia.indexNameMovies[appName], context.params.movieId) as Promise<boolean>);

  await Promise.all(promises);

  console.log(`Movie ${movie.id} removed`);
}

export async function onMovieUpdate(
  change: Change<FirebaseFirestore.DocumentSnapshot>
) {
  const before = change.before.data() as MovieDocument;
  const after = change.after.data() as MovieDocument;
  if (!after) { return; }

  await cleanMovieMedias(before, after);
  await moveMovieMedia(before, after);

  const isMovieSubmitted = isSubmitted(before.app, after.app);
  const isMovieAccepted = isAccepted(before.app, after.app);
  const appAccess = apps.find(a => !!after.app[a].access);
  const organizations = await getOrganizationsOfMovie(after.id);

  if (isMovieSubmitted) { // When movie is submitted to Archipel Content or Media Financiers
    const movieWasSubmittedOn = wasSubmittedOn(before.app, after.app)[0];
    // Mail to supportEmails.[app]
    const from = getMailSender(movieWasSubmittedOn);
    await sendMail(sendMovieSubmittedEmail(movieWasSubmittedOn, after), from, groupIds.noUnsubscribeLink);

    // Notification to users related to current movie
    const notifications = organizations
      .filter(organizationDocument => !!organizationDocument?.userIds?.length)
      .reduce((ids: string[], org) => ids.concat(org.userIds), [])
      .map(
        toUserId => createNotification({
          toUserId,
          type: 'movieSubmitted',
          docId: after.id,
          _meta: createDocumentMeta({ createdFrom: appAccess })
        })
      );

    await triggerNotifications(notifications);
  }

  if (isMovieAccepted) { // When Archipel Content accept the movie
    const notifications = organizations
      .filter(organizationDocument => !!organizationDocument?.userIds?.length)
      .reduce((ids: string[], org) => ids.concat(org.userIds), [])
      .map(toUserId => {
        return createNotification({
          toUserId,
          type: 'movieAccepted',
          docId: after.id,
          _meta: createDocumentMeta({ createdFrom: appAccess })
        });
      });

    await triggerNotifications(notifications);
  }

  // If movie was accepted but is not anymore, clean wishlists
  if (Object.keys(after.app).map(a => before.app[a].status === 'accepted' && after.app[a].status !== before.app[a].status)) {
    await removeMovieFromWishlists(after);
  }

  // Change documentPermission docs based on orgIds change
  const addedOrgIds = after.orgIds.filter(id => !before.orgIds.includes(id));
  const removedOrgIds = before.orgIds.filter(id => !after.orgIds.includes(id));

  const addedPromises = addedOrgIds.map(orgId => {
    const permissions = createDocPermissions({ id: after.id, ownerId: orgId });
    return db.doc(`permissions/${orgId}/documentPermissions/${after.id}`).set(permissions);
  });
  const removedPromises = removedOrgIds.map(orgId => db.doc(`permissions/${orgId}/documentPermissions/${after.id}`).delete());
  await Promise.all([...addedPromises, ...removedPromises]); 

  // insert orgName & orgID to the algolia movie index (this is needed in order to filter on the frontend)
  for (const org of organizations) {
    await storeSearchableOrg(org);
  }
  const orgNames = organizations.map(org => orgName(org)).filter(orgName => !!orgName);
  await storeSearchableMovie(after, orgNames);

  for (const app in after.app) {
    if (after.app[app].access === false && before.app[app].access !== after.app[app].access) {
      await deleteObject(algolia.indexNameMovies[app], before.id);
    }
  }
}

export async function createAskingPriceRequest(data: { uid: string, movieId: string, territories: string, message: string }, context: CallableContext) {
  const { uid, movieId, territories, message } = data;

  if (!context?.auth) throw new Error('Permission denied: missing auth context.');
  if (!uid) throw new Error('User id is mandatory for requesting asking price');
  if (!movieId) throw new Error('Movie id is mandatory for requesting asking price');

  const [user, movie] = await Promise.all([
    getDocument<PublicUser>(`users/${uid}`),
    getDocument<Movie>(`movies/${movieId}`)
  ]);

  const getNotifications = (org: Organization) => org.userIds.map(userId => createNotification({
    toUserId: userId,
    type: 'movieAskingPriceRequested',
    docId: movieId,
    data: { territories, message },
    user: createPublicUserDocument(user),
    _meta: createDocumentMeta({ createdFrom: 'festival' })
  }));

  for (const orgId of movie.orgIds) {
    getDocument<Organization>(`orgs/${orgId}`)
      .then(getNotifications)
      .then(triggerNotifications);
  }

  // Send notification to user who requested the asking price
  const notification = createNotification({
    toUserId: uid,
    type: 'movieAskingPriceRequestSent',
    docId: movieId,
    data: { territories, message },
    user: createPublicUserDocument(user),
    _meta: createDocumentMeta({ createdFrom: 'festival' })
  });
  triggerNotifications([notification]);
}

/** Checks if the store status is going from draft to submitted. */
function isSubmitted(previousAppConfig: AppConfigMap, currentAppConfig: AppConfigMap) {
  return apps.some(app => {
    return (previousAppConfig && previousAppConfig[app].status === 'draft') && (currentAppConfig && currentAppConfig[app].status === 'submitted');
  })
}

/** Return from which app(s) a movie is going from draft to submitted. */
function wasSubmittedOn(previousAppConfig: AppConfigMap, currentAppConfig: AppConfigMap): App[] {
  return apps.filter(app => {
    if (!previousAppConfig[app] || !currentAppConfig[app]) return false;
    const wasDraft = previousAppConfig[app].status === 'draft';
    const isSubmitted = currentAppConfig[app].status === 'submitted';
    return wasDraft && isSubmitted;
  });
}

/** Checks if the store status is going from submitted to accepted. */
function isAccepted(previousAppConfig: AppConfigMap, currentAppConfig: AppConfigMap) {
  return apps.some(app => {
    if (app === 'festival') {
      // in festival `draft` -> `accepted`
      return (previousAppConfig && previousAppConfig[app].status === 'draft') && (currentAppConfig && currentAppConfig[app].status === 'accepted');
    }
    // in catalog/financiers `draft` -> `submitted` -> `accepted`
    return (previousAppConfig && previousAppConfig[app].status === 'submitted') && (currentAppConfig && currentAppConfig[app].status === 'accepted');
  });
}

async function removeMovieFromWishlists(movie: MovieDocument, batch?: FirebaseFirestore.WriteBatch) {
  const collection = db.collection('orgs');
  const orgsWithWishlists = await collection.where('wishlist', 'array-contains', movie.id).get();
  const updates: Promise<FirebaseFirestore.WriteResult>[] = [];
  for (const o of orgsWithWishlists.docs) {
    const org = o.data();
    org.wishlist = org.wishlist.filter(movieId => movieId !== movie.id);
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
