import { functions, db } from './internals/firebase';
import { MovieDocument, OrganizationDocument, PublicUser, StoreConfig, PublicOrganization } from './data/types';
import { NotificationType } from '@blockframes/notification/types';
import { triggerNotifications, createNotification } from './notification';
import { flatten, isEqual } from 'lodash';
import { getDocument, getOrganizationsOfMovie } from './data/internals';
import { removeAllSubcollections } from './utils';
import { storeSearchableMovie, deleteSearchableMovie } from './internals/algolia';
import { centralOrgID } from './environments/environment';

/** Create a notification with user and movie. */
function notifUser(userId: string, notificationType: NotificationType, movie: MovieDocument, user: PublicUser) {
  return createNotification({
    userId,
    user: { name: user.name, surname: user.surname },
    type: notificationType,
    app: 'blockframes',
    movie: {
      id: movie.id,
      title: {
        international: movie.main.title.international || '',
        original: movie.main.title.original
      }
    }
  });
}

/** Create notifications for all org's members. */
async function createNotificationsForUsers(movie: MovieDocument, notificationType: NotificationType, user: PublicUser) {
  const orgsSnapShot = await db
    .collection(`orgs`)
    .where('movieIds', 'array-contains', movie.id)
    .get();

  const orgs = orgsSnapShot.docs.map(org => org.data() as OrganizationDocument);

  return flatten(orgs.map(org => org.userIds.map(userId => notifUser(userId, notificationType, movie, user))));
}

/** Function triggered when a document is added into movies collection. */
export async function onMovieCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  const movie = snap.data() as MovieDocument;

  if (!movie) {
    console.error('Invalid movie data:', movie);
    throw new Error('movie update function got invalid movie data');
  }

  // Get the user document and create notifications.
  const user = await getDocument<PublicUser>(`users/${movie._meta!.createdBy}`);
  const notifications = await createNotificationsForUsers(movie, 'movieTitleCreated', user);

  return db.runTransaction(async tx => {

    // Get the organization document in the transaction for maximum freshness.
    const organizationSnap = await tx.get(db.doc(`orgs/${user.orgId}`));
    const organization = organizationSnap.data() as OrganizationDocument

    // Update algolia's index
    await storeSearchableMovie(movie, organization.id, organization.denomination.full);

    return Promise.all([
      // Update the organization's movieIds with the new movie id.
      tx.update(organizationSnap.ref, { movieIds: [...organization.movieIds, movie.id] }),
      // Send notifications about this new movie to each organization member.
      triggerNotifications(notifications)
    ]);
  });
}

/** Remove a movie and send notifications to all users of concerned organizations. */
export async function onMovieDelete(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  const movie = snap.data() as MovieDocument;

  const userSnapshot = await db.doc(`users/${movie._meta!.deletedBy}`).get();
  const user = userSnapshot.data() as PublicUser;

  /**
   *  When a movie is deleted, we also delete its sub-collections and references in other collections/documents.
   *  As we delete all deliveries linked to a movie, deliveries sub-collections and references will also be
   *  automatically deleted in the process.
   */

  const batch = db.batch();

  const organizations = await db.collection(`orgs`).get();
  // TODO: .where('movieIds', 'array-contains', movie.id) doesn't seem to work. => ISSUE#908

  organizations.forEach(async doc => {
    const organization = await getDocument<OrganizationDocument>(`orgs/${doc.id}`);

    if (organization.movieIds.includes(movie.id)) {
      console.log(`delete movie id reference in organization ${doc.data().id}`);
      batch.update(doc.ref, {
        movieIds: doc.data().movieIds.filter((movieId: string) => movieId !== movie.id)
      });
    }
  });

  const notifications = await createNotificationsForUsers(movie, 'movieDeleted', user);

  // Delete sub-collections
  await removeAllSubcollections(snap, batch);

  // Update algolia's index
  await deleteSearchableMovie(context.params.movieId);

  console.log(`removed sub colletions of ${movie.id}`);
  await batch.commit();

  return triggerNotifications(notifications);
}

export async function onMovieUpdate(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
): Promise<any> {
  const before = change.before.data() as MovieDocument;
  const after = change.after.data() as MovieDocument;

  const isMovieSubmitted = isSubmitted(before.main.storeConfig, after.main.storeConfig);
  const isMovieAccepted = isAccepted(before.main.storeConfig, after.main.storeConfig);
  const hasTitleChanged = !!before.main.title.international && !isEqual(before.main.title.international, after.main.title.international);

  if (isMovieSubmitted) { // When movie is submitted to Archipel Content
    const archipelContent = await getDocument<OrganizationDocument>(`orgs/${centralOrgID}`);
    const notifications = archipelContent.userIds.map(
      userId => createNotification({
        userId,
        type: 'movieSubmitted',
        docId: after.id,
        app: 'biggerBoat'
      })
    );

    return triggerNotifications(notifications);
  }

  if (isMovieAccepted) { // When Archipel Content accept the movie
    const organizations = await getOrganizationsOfMovie(after.id);
    const notifications = organizations
    .filter(organizationDocument => !!organizationDocument && !!organizationDocument.userIds)
    .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
    .map(userId => {
      return createNotification({
        userId,
        type: 'movieAccepted',
        docId: after.id,
        app: 'biggerBoat'
      });
    });

    return triggerNotifications(notifications);
  }

  if (hasTitleChanged) {
    const userSnapshot = await db.doc(`users/${after._meta!.updatedBy}`).get();
    const user = userSnapshot.data() as PublicUser;
    const notifications = await createNotificationsForUsers(before, 'movieTitleUpdated', user);

    return triggerNotifications(notifications);
  }

  // insert orgName & orgID to the algolia movie index (this is needed in order to filter on the frontend)
  const creatorSnapshot = await db.doc(`users/${after._meta!.createdBy}`).get();
  const creator = creatorSnapshot.data() as PublicUser;
  const creatorOrgSnapshot = await db.doc(`orgs/${creator!.orgId}`).get();
  const creatorOrg = creatorOrgSnapshot.data() as PublicOrganization;

  if (creatorOrg.denomination?.full) {
    return storeSearchableMovie(after, creatorOrg.denomination.full);
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
  return (
    (beforeStore && beforeStore.status === 'submitted') &&
    (afterStore && afterStore.status === 'accepted')
  )
}
