import { db } from './internals/firebase';
import { MovieDocument, OrganizationDocument, PublicUser } from './data/types';
import { triggerNotifications, createNotification } from './notification';
import { createDocumentMeta, getDocument, getOrganizationsOfMovie } from './data/internals';
import { removeAllSubcollections } from './utils';

import { centralOrgID } from './environments/environment';
import { orgName } from '@blockframes/organization/+state/organization.firestore';
import { cleanMovieMedias } from './media';
import { Change, EventContext } from 'firebase-functions';
import { algolia, deleteObject, storeSearchableMovie, storeSearchableOrg } from '@blockframes/firebase-utils';
import { app as apps } from '@blockframes/utils/apps';

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

  if (Object.keys(movie.app).some(app => movie.app[app].status === 'accepted')) {
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

  // Delete events
  const events = await db.collection('events').where('meta.titleId', '==', movie.id).get();
  events.docs.forEach(d => batch.delete(d.ref));


  // Delete sub-collections (distribution rights)
  await removeAllSubcollections(snap, batch);

  // Delete permissions
  const orgsPromises = movie.orgIds.map(o => db.collection('orgs').where('id', '==', o).get());
  const _orgs = await Promise.all(orgsPromises);
  const orgIds: string[] = [];
  _orgs.forEach(s => { s.docs.forEach(d => orgIds.push(d.id)) });
  const permissionsPromises = orgIds.map(orgId => db.doc(`permissions/${orgId}/documentPermissions/${movie.id}`).get());
  const permissions = await Promise.all(permissionsPromises);
  permissions.forEach(p => batch.delete(p.ref));

  // Delete notifications
  const notifsCollectionRef = await db.collection('notifications').where('docId', '==', movie.id).get();
  for (const doc of notifsCollectionRef.docs) {
    batch.delete(doc.ref);
  }

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
  const movieAppAccess = Object.keys(movie.app).filter(app => movie.app[app].access);
  const promises = movieAppAccess.map(appName => deleteObject(algolia.indexNameMovies[appName], context.params.movieId) as Promise<boolean>);

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

  const isMovieSubmitted = isSubmitted(before.app, after.app);
  const isMovieAccepted = isAccepted(before.app, after.app);
  const appAccess = apps.filter(a => a !=='crm').filter(a => !!after.app[a].access);

  if (isMovieSubmitted) { // When movie is submitted to Archipel Content
    const archipelContent = await getDocument<OrganizationDocument>(`orgs/${centralOrgID}`);
    const notifications = archipelContent.userIds.map(
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
  if (Object.keys(before.app).map(a => before.app[a].status === 'accepted')
    && Object.keys(after.app).map(a => after.app[a].status !== before.app[a].status)) {
    await removeMovieFromWishlists(after);
  }

  // insert orgName & orgID to the algolia movie index (this is needed in order to filter on the frontend)
  const creator = await getDocument<PublicUser>(`users/${after._meta!.createdBy}`);
  const creatorOrg = await getDocument<OrganizationDocument>(`orgs/${creator!.orgId}`);

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
function isSubmitted(beforeApp, afterApp) {
  let submitted = false;
  for (const app of apps.filter(a => a !== 'crm')) {
    submitted = (beforeApp && beforeApp[app].status === 'draft') && (afterApp && afterApp[app].status === 'submitted');
    if (!!submitted) return submitted;
  }
  return submitted;
}

/** Checks if the store status is going from submitted to accepted. */
function isAccepted(beforeApp, afterApp) {
  let accepted = false;
  for (const app of apps.filter(a => a !== 'crm')) {
    if (app === 'festival') {
      // in festival `draft` -> `accepted`
      accepted = (beforeApp && beforeApp[app].status === 'draft') && (afterApp && afterApp[app].status === 'accepted');
      return accepted;
    } else {
      // in catalog/financiers `draft` -> `submitted` -> `accepted`
      accepted = (beforeApp && beforeApp[app].status === 'submitted') && (afterApp && afterApp[app].status === 'accepted');
      return accepted;
    }
  }
  return accepted;
}

async function removeMovieFromWishlists(movie: MovieDocument, batch?: FirebaseFirestore.WriteBatch) {
  const collection = db.collection('orgs');
  const orgsWithWishlists = await collection.where('wishlist', 'array-contains', movie.id).get();
  const updates: Promise<any>[] = [];
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
    await (Promise as any).allSettled(updates);
  }
}
