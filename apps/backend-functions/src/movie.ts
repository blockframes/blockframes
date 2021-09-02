import { db } from './internals/firebase';
import { MovieDocument, OrganizationDocument, PublicUser } from './data/types';
import { triggerNotifications, createNotification } from './notification';
import { createDocumentMeta, getDocument, getOrganizationsOfMovie, Timestamp } from './data/internals';
import { removeAllSubcollections } from './utils';

import { orgName } from '@blockframes/organization/+state/organization.firestore';
import { MovieAppConfig } from '@blockframes/movie/+state/movie.firestore';
import { cleanMovieMedias } from './media';
import { Change, EventContext } from 'firebase-functions';
import { algolia, deleteObject, storeSearchableMovie, storeSearchableOrg } from '@blockframes/firebase-utils';
import { App, getAllAppsExcept, getMovieAppAccess, checkMovieStatus, getSendgridFrom } from '@blockframes/utils/apps';
import { Bucket } from '@blockframes/contract/bucket/+state/bucket.model';
import { sendMovieSubmittedEmail } from './templates/mail';
import { sendMail } from './internals/email';

const apps: App[] = getAllAppsExcept(['crm']);

/** Function triggered when a document is added into movies collection. */
export async function onMovieCreate(
  snap: FirebaseFirestore.DocumentSnapshot
) {
  const movie = snap.data() as MovieDocument;

  if (!movie) {
    console.error('Invalid movie data:', movie);
    throw new Error('movie update function got invalid movie data');
  }

  const user = await getDocument<PublicUser>(`users/${movie._meta.createdBy}`);
  const organization = await getDocument<OrganizationDocument>(`orgs/${user.orgId}`);

  if (checkMovieStatus(movie, 'accepted')) {
    await storeSearchableOrg(organization);
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
  await removeMovieFromWishlists(movie, batch);

  // Delete sub-collections (distribution rights)
  await removeAllSubcollections(snap, batch);

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

  const isMovieSubmitted = isSubmitted(before.app, after.app);
  const isMovieAccepted = isAccepted(before.app, after.app);
  const appAccess = apps.filter(a => !!after.app[a].access);

  if (isMovieSubmitted) { // When movie is submitted to Archipel Content or Media Financiers
    const movieWasSubmittedOn = wasSubmittedOn(before.app, after.app)[0];
    // Mail to supportEmails.[app]
    const from = getSendgridFrom(movieWasSubmittedOn);
    await sendMail(sendMovieSubmittedEmail(movieWasSubmittedOn, after), from);

    // Notification to users related to current movie
    const organizations = await getOrganizationsOfMovie(after.id);
    const notifications = organizations
      .filter(organizationDocument => !!organizationDocument && !!organizationDocument.userIds)
      .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
      .map(
        toUserId => createNotification({
          toUserId,
          type: 'movieSubmitted',
          docId: after.id,
          _meta: createDocumentMeta({ createdFrom: appAccess[0] })
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
          docId: after.id,
          _meta: createDocumentMeta({ createdFrom: appAccess[0] })
        });
      });

    await triggerNotifications(notifications);
  }

  // If movie was accepted but is not anymore, clean wishlists
  if (Object.keys(after.app).map(a => before.app[a].status === 'accepted' && after.app[a].status !== before.app[a].status)) {
    await removeMovieFromWishlists(after);
  }

  // insert orgName & orgID to the algolia movie index (this is needed in order to filter on the frontend)
  const creator = await getDocument<PublicUser>(`users/${after._meta.createdBy}`);
  const creatorOrg = await getDocument<OrganizationDocument>(`orgs/${creator.orgId}`);

  if (creatorOrg.denomination?.full) {
    await storeSearchableOrg(creatorOrg);
    await storeSearchableMovie(after, orgName(creatorOrg));
    for (const app in after.app) {
      if (after.app[app].access === false && before.app[app].access !== after.app[app].access) {
        await deleteObject(algolia.indexNameMovies[app], before.id);
      }
    }
  }
}

/** Checks if the store status is going from draft to submitted. */
function isSubmitted(
  beforeApp: Partial<{ [app in App]: MovieAppConfig<Timestamp> }>,
  afterApp: Partial<{ [app in App]: MovieAppConfig<Timestamp> }>) {
  return apps.some(app => {
    return (beforeApp && beforeApp[app].status === 'draft') && (afterApp && afterApp[app].status === 'submitted');
  })
}

/** Return from which app(s) a movie is going from draft to submitted. */
function wasSubmittedOn(
  beforeApp: Partial<{ [app in App]: MovieAppConfig<Timestamp> }>,
  afterApp: Partial<{ [app in App]: MovieAppConfig<Timestamp> }>): App[] {
  return apps.map(app => {
    return (beforeApp && beforeApp[app].status === 'draft') && (afterApp && afterApp[app].status === 'submitted') ? app : undefined;
  }).filter(a => !!a)
}

/** Checks if the store status is going from submitted to accepted. */
function isAccepted(
  beforeApp: Partial<{ [app in App]: MovieAppConfig<Timestamp> }>,
  afterApp: Partial<{ [app in App]: MovieAppConfig<Timestamp> }>) {
  return apps.some(app => {
    if (app === 'festival') {
      // in festival `draft` -> `accepted`
      return (beforeApp && beforeApp[app].status === 'draft') && (afterApp && afterApp[app].status === 'accepted');
    }
    // in catalog/financiers `draft` -> `submitted` -> `accepted`
    return (beforeApp && beforeApp[app].status === 'submitted') && (afterApp && afterApp[app].status === 'accepted');
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
