import { functions, db } from './internals/firebase';
import { MovieDocument, OrganizationDocument, PublicUser, createDocPermissions } from './data/types';
import { createNotification, NotificationType } from '@blockframes/notification/types';
import { App } from '@blockframes/utils/apps';
import { triggerNotifications } from './notification';
import { flatten, isEqual } from 'lodash';
import { getDocument } from './data/internals';

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

export async function onMovieCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  const movie = snap.data() as MovieDocument;

  const userSnapshot = await db.doc(`users/${movie._meta!.createdBy}`).get();
  const user = userSnapshot.data() as PublicUser;

  if (!movie) {
    console.error('Invalid movie data:', movie);
    throw new Error('movie update function got invalid movie data');
  }

  try {
    const { orgId } = await getDocument(`users/${user.uid}`);
    const [organization, permissions, notifications ] = await Promise.all([
      getDocument<OrganizationDocument>(`orgs/${orgId}`),
      createDocPermissions({id: movie.id, ownerId: orgId}),
      createNotificationsForUsers(movie, NotificationType.movieTitleCreated, user)
    ]);

    return Promise.all([
      // Update or create the processedId to avoid multiple executions of the function.
      db.doc(`movies/${movie.id}`).update({ processedId: context.eventId }),
      // Push new movie id into organization's movieIds array.
      db.doc(`orgs/${orgId}`).update({ movieIds: [...organization.movieIds, movie.id] }),
      // Create permissions document for this new movie.
      db.doc(`permissions/${orgId}/documentPermissions/${permissions.id}`).set(permissions),
      // Trigger the notifications for the organization users.
      triggerNotifications(notifications)
    ]);
  } catch (error) {
    await db
      .doc(`movies/${movie.id}`).update({ processedId: null });
    throw error;
  }
}

/** Remove a movie and send notifications to all users of concerned organizations. */
export async function onMovieDelete(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  const movie = snap.data() as MovieDocument;

  const userSnapshot = await db.doc(`users/${movie._meta!.deletedBy}`).get();
  const user = userSnapshot.data() as PublicUser;

  const notifications = await createNotificationsForUsers(movie, NotificationType.movieDeleted, user);

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
