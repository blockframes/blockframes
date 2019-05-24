import { functions, db } from './firebase';
import { APP_DELIVERY_ICON } from './delivery';
import { prepareNotification, triggerNotifications, DocID, customMessage } from './notify';
import { getDocument, getCount, getOrgsOfDelivery, getOrgsOfMovie, Delivery, Organization, Movie } from './utils';

const APP_MOVIE_ICON = 'media_financiers';

export async function onDeliveryStakeholderCreate (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  if (!snap.data()) {
    return true;
  }

  const delivery = await getDocument<Delivery>(`deliveries/${context.params.deliveryID}`);
  const newStakeholder = snap.data();
  const newStakeholderOrg = await getDocument<Organization>(`orgs/${newStakeholder!.orgId}`);

  if (!!delivery && !!newStakeholder && !!newStakeholderOrg) {
    const deliveryDoc = await db.doc(`deliveries/${delivery.id}`).get();
    const processedId = deliveryDoc.data()!.processedId;

    if (processedId === context.eventId) {
      return true;
    }

    try {
      const movie = await getDocument<Movie>(`movies/${delivery.movieId}`);
      const docID = {id: delivery.id, type: 'delivery'} as DocID;
      const stakeholderCount = await getCount(`deliveries/${delivery.id}/stakeholders`);
      const snapInformations = {
        movieTitle: movie!.title.original,
        docID,
        stakeholderId: newStakeholder.id,
        orgName: newStakeholderOrg.name,
        count: stakeholderCount,
        userIds: newStakeholderOrg.userIds
      };
      const orgs = await getOrgsOfDelivery(delivery.id);
      const notifications = orgs
        .filter(org => !!org && !!org.userIds)
        .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
        .map((userId: string) => {
          return prepareNotification({
            app: APP_DELIVERY_ICON,
            message: customMessage(userId, snapInformations),
            userId,
            path: `/layout/${delivery.movieId}/form/${delivery.id}/teamwork`,
            docID,
            stakeholderId: newStakeholder.id
          });
        });

      await triggerNotifications(notifications);
    } catch (e) {
      await db.doc(`deliveries/${delivery.id}`).update({ processedId: null });
      throw e;
    }
    return true;
  }
  return true;
};

export async function onDeliveryStakeholderDelete (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  if (!snap.data()) {
    return true;
  }

  // TODO: Code is very similar to onStakeholderCreate. We should be able to factor some part of it.

  const delivery = await getDocument<Delivery>(`deliveries/${context.params.deliveryID}`);
  const stakeholder = snap.data();
  const stakeholderOrg = await getDocument<Organization>(`orgs/${stakeholder!.orgId}`);

  if (!!delivery && !!stakeholder && !!stakeholderOrg) {
    const deliveryDoc = await db.doc(`deliveries/${delivery.id}`).get();
    const processedId = deliveryDoc.data()!.processedId;

    if (processedId === context.eventId) {
      return true;
    }

    try {
      const movie = await getDocument<Movie>(`movies/${delivery.movieId}`);
      const orgs = await getOrgsOfDelivery(delivery.id);
      const notifications = orgs
        .filter(org => !!org && !!org.userIds)
        .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
        .map((userId: string) =>
          prepareNotification({
            app: APP_DELIVERY_ICON,
            message: `${stakeholderOrg.name}
            has been removed from ${movie!.title.original}'s delivery`,
            userId,
            path: `/layout/${delivery.movieId}/form/${delivery.id}/teamwork`
          })
        );

      await triggerNotifications(notifications);
    } catch (e) {
      await db.doc(`deliveries/${delivery.id}`).update({ processedId: null });
      throw e;
    }
    return true;
  }
  return true;
};

export async function onMovieStakeholderCreate (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  if (!snap.data()) {
    return true;
  }

  // TODO: Code is very similar to onStakeholderCreate. We should be able to factor some part of it.

  const movie = await getDocument<Movie>(`movies/${context.params.movieID}`);
  const newStakeholder = snap.data();
  const newStakeholderOrg = await getDocument<Organization>(`orgs/${newStakeholder!.orgId}`);

  if (!!movie && !!newStakeholder && !!newStakeholderOrg) {
    const movieDoc = await db.doc(`movies/${movie.id}`).get();
    const processedId = movieDoc.data()!.processedId;

    if (processedId === context.eventId) {
      return true;
    }

    try {
      const docID = {id: movie.id, type: 'movie'} as DocID;
      const stakeholderCount = await getCount(`movies/${movie.id}/stakeholders`);
      const snapInformations = {
        movieTitle: movie.title.original,
        docID,
        stakeholderId: newStakeholder.id,
        orgName: newStakeholderOrg.name,
        count: stakeholderCount,
        userIds: newStakeholderOrg.userIds
      }
      const orgs = await getOrgsOfMovie(movie.id);
      const notifications = orgs
        .filter(org => !!org && !!org.userIds)
        .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
        .map((userId: string) => {
          return prepareNotification({
            app: APP_MOVIE_ICON,
            message: customMessage(userId, snapInformations),
            userId,
            path: `/layout/home/form/${movie.id}/teamwork`,
            docID,
            stakeholderId: newStakeholder.id
          });
        });

      await triggerNotifications(notifications);
    } catch (e) {
      await db.doc(`movies/${movie.id}`).update({ processedId: null });
      throw e;
    }
    return true;
  }
  return true;
};

export async function onMovieStakeholderDelete (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  if (!snap.data()) {
    return true;
  }

  // TODO: Code is very similar to onStakeholderCreate. We should be able to factor some part of it.

  const movie = await getDocument<Movie>(`movies/${context.params.movieID}`);
  const stakeholder = snap.data();
  const stakeholderOrg = await getDocument<Organization>(`orgs/${stakeholder!.orgId}`);

  if (!!movie && !!stakeholder && !!stakeholderOrg) {
    const movieDoc = await db.doc(`movies/${movie.id}`).get();
    const processedId = movieDoc.data()!.processedId;

    if (processedId === context.eventId) {
      return true;
    }

    try {
      const orgs = await getOrgsOfMovie(movie.id);
      const notifications = orgs
        .filter(org => !!org && !!org.userIds)
        .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
        .map((userId: string) =>
          prepareNotification({
            app: APP_MOVIE_ICON,
            message: `${stakeholderOrg.name}
            has been removed from ${movie.title.original}`,
            userId,
            path: `/layout/home/form/${movie.id}/teamwork`
          })
        );

      await triggerNotifications(notifications);
    } catch (e) {
      await db.doc(`movies/${movie.id}`).update({ processedId: null });
      throw e;
    }
    return true;
  }
  return true;
};
