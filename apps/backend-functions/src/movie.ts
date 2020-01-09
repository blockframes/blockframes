import { functions, db } from './internals/firebase';
import { MovieDocument, OrganizationDocument, PublicUser } from './data/types';
import { createNotification, NotificationType } from '@blockframes/notification/types';
import { App } from '@blockframes/utils/apps';
import { triggerNotifications } from './notification';
import { flatten, isEqual } from 'lodash';
import { getDocument } from './data/internals';
import { removeAllSubcollections } from './utils';

/** Create a notification with user and movie. */
function notifUser(userId: string, notificationType: NotificationType, movie: MovieDocument, user: PublicUser) {
  return createNotification({
    userId,
    user: { name: user.name, surname: user.surname },
    type: notificationType,
    app: App.blockframes,
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

  // Get the user document.
  const user = await getDocument<PublicUser>(`users/${movie._meta!.createdBy}`);

  if (!movie) {
    console.error('Invalid movie data:', movie);
    throw new Error('movie update function got invalid movie data');
  }

  // Create notifications and getting organization snapshot.
  const [notifications, organizationSnap] = await Promise.all([
    createNotificationsForUsers(movie, NotificationType.movieTitleCreated, user),
    db.doc(`orgs/${user.orgId}`).get()
  ]);

  return db.runTransaction(async tx => {
    // Get the organization document in the transaction for maximum freshness.
    const organizationDoc = await tx.get(organizationSnap.ref);
    const organization = organizationDoc.data() as OrganizationDocument

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

  const deliveries = await db.collection(`deliveries`).get();
  // TODO: .where(movie.deliveryIds, 'array-contains', 'id') doesn't seem to work. => ISSUE#908

  deliveries.forEach(doc => {
    if (movie.deliveryIds.includes(doc.data().id)) {
      console.log(`delivery ${doc.id} deleted`);
      batch.delete(doc.ref);
    }
  });

  const notifications = await createNotificationsForUsers(movie, NotificationType.movieDeleted, user);

  // Delete sub-collections
  await removeAllSubcollections(snap, batch);
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

  const userSnapshot = await db.doc(`users/${after._meta!.updatedBy}`).get();
  const user = userSnapshot.data() as PublicUser;

  const hasTitleChanged = !!before.main.title.international && !isEqual(before.main.title.international, after.main.title.international);

  if (hasTitleChanged) {
    const notifications = await createNotificationsForUsers(before, NotificationType.movieTitleUpdated, user);

    return triggerNotifications(notifications);
  }
}
