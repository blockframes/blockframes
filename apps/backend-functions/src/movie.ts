import { db } from './internals/firebase';
import { triggerNotifications } from './notification';
import { getOrganizationsOfMovie } from './data/internals';
import { cleanMovieMedias, moveMovieMedia } from './media';
import { EventContext } from 'firebase-functions';
import { algolia, deleteObject, storeSearchableMovie, storeSearchableOrg, indexExists } from '@blockframes/firebase-utils/algolia';
import { getMailSender } from '@blockframes/utils/apps';
import { askingPriceRequested, screenerRequested, sendMovieSubmittedEmail } from './templates/mail';
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
  RequestAskingPriceData
} from '@blockframes/model';
import { BlockframesChange, BlockframesSnapshot, getDocument } from '@blockframes/firebase-utils';

const apps: App[] = getAllAppsExcept(['crm']);

type AppConfigMap = Partial<{ [app in App]: MovieAppConfig }>;

/** Function triggered when a document is added into movies collection. */
export async function onMovieCreate(snap: BlockframesSnapshot<Movie>) {
  const movie = snap.data();

  if (!movie || !movie.id) {
    console.error('Invalid movie data:', movie);
    throw new Error('movie update function got invalid movie data');
  }

  const organizations = await getOrganizationsOfMovie(movie.id);
  for (const org of organizations) {
    await storeSearchableOrg(org);
  }

  return storeSearchableMovie(movie, organizations);
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

    // Read waterfall
    const waterfallsCollectionRef = await tx.get(db.doc(`waterfall/${movie.id}`));

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

    // Delete waterfall
    if (waterfallsCollectionRef.exists) {
      tx.delete(waterfallsCollectionRef.ref);
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
  const movieAppAccess = getMovieAppAccess(movie).filter(app => indexExists('indexNameMovies', app));
  const promises = movieAppAccess.map(
    (appName) => deleteObject(algolia.indexNameMovies[appName], context.params.movieId) as Promise<boolean>
  );

  await Promise.all(promises);

  console.log(`Movie ${movie.id} removed`);
}

export async function onMovieUpdate(change: BlockframesChange<Movie>) {
  const before = change.before.data();
  const after = change.after.data();
  if (!after || !after.id) return;

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

  // Update orgs related to movies
  for (const org of organizations) {
    await storeSearchableOrg(org);
  }

  // insert orgName & orgId to the algolia movie index (this is needed in order to filter on the frontend)
  await storeSearchableMovie(after, organizations);

  for (const app in after.app) {
    const movieLostAccess = after.app[app].access === false && before.app[app].access !== after.app[app].access;
    if (movieLostAccess && indexExists('indexNameMovies', app as App)) {
      await deleteObject(algolia.indexNameMovies[app], before.id);
    }
  }
}

export async function createAskingPriceRequest(data: RequestAskingPriceData, context: CallableContext) {
  const { uid, movieId, territories, medias, message, exclusive, app } = data;

  if (!context?.auth) throw new Error('Permission denied: missing auth context.');
  if (!uid) throw new Error('User id is mandatory for requesting asking price');
  if (!movieId) throw new Error('Movie id is mandatory for requesting asking price');

  const notificationData: { territories: string, medias?: string, message?: string, exclusive?: string } = { territories };
  if (medias) notificationData.medias = medias;
  if (message) notificationData.message = message;
  if (exclusive !== undefined) notificationData.exclusive = exclusive ? 'yes' : 'no';

  const [user, movie] = await Promise.all([
    getDocument<PublicUser>(`users/${uid}`),
    getDocument<Movie>(`movies/${movieId}`)
  ]);

  const buyerOrg = await getDocument<Organization>(`orgs/${user.orgId}`);

  const getNotifications = (org: Organization) =>
    org.userIds.map((userId) =>
      createNotification({
        toUserId: userId,
        type: 'movieAskingPriceRequested',
        docId: movieId,
        data: notificationData,
        user: createPublicUser(user),
        _meta: createInternalDocumentMeta({ createdFrom: app }),
      })
    );


  const sellerOrgs = await Promise.all(movie.orgIds.map(orgId => getDocument<Organization>(`orgs/${orgId}`)));
  sellerOrgs.map(getNotifications).map(triggerNotifications);

  // Send notification to user who requested the asking price
  const notification = createNotification({
    toUserId: uid,
    type: 'movieAskingPriceRequestSent',
    docId: movieId,
    data: notificationData,
    user: createPublicUser(user),
    _meta: createInternalDocumentMeta({ createdFrom: app }),
  });
  triggerNotifications([notification]);

  const adminEmail = askingPriceRequested(movie, buyerOrg, sellerOrgs, data);
  const from = getMailSender(app);
  return sendMail(adminEmail, from, groupIds.noUnsubscribeLink).catch(e => console.warn(e.message));
}

export async function createScreenerRequest(
  data: { uid: string; movieId: string },
  context: CallableContext
) {
  const { uid, movieId } = data;

  if (!context?.auth) {
    throw new Error('Permission denied: missing auth context.');
  }
  if (!uid) {
    throw new Error('User id is mandatory for screener requested');
  }
  if (!movieId) {
    throw new Error('Movie id is mandatory for screener requested');
  }

  const [user, movie] = await Promise.all([
    getDocument<PublicUser>(`users/${uid}`),
    getDocument<Movie>(`movies/${movieId}`),
  ]);

  const buyerOrg = await getDocument<Organization>(`orgs/${user.orgId}`);

  const getNotifications = (org: Organization) =>
    org.userIds.map((userId) =>
      createNotification({
        toUserId: userId,
        type: 'screenerRequested',
        docId: movieId,
        user: createPublicUser(user),
        _meta: createInternalDocumentMeta({ createdFrom: 'catalog' }),
      })
    );

  const sellerOrgs = await Promise.all(movie.orgIds.map(orgId => getDocument<Organization>(`orgs/${orgId}`)));
  sellerOrgs.map(getNotifications).map(triggerNotifications);

  // notification to user who requested the screener
  const notification = createNotification({
    toUserId: uid,
    type: 'screenerRequestSent',
    docId: movieId,
    user: createPublicUser(user),
    _meta: createInternalDocumentMeta({ createdFrom: 'catalog' }),
  });
  triggerNotifications([notification]);

  const adminEmail = screenerRequested(movie, buyerOrg, sellerOrgs);
  const from = getMailSender('catalog');
  return sendMail(adminEmail, from, groupIds.noUnsubscribeLink).catch(e => console.warn(e.message));
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
