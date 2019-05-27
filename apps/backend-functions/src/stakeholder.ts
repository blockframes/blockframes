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

  const newStakeholder = snap.data();

  if (!newStakeholder) {
    throw new Error(`New stakeholder not found !`)
  }

  const [delivery, newStakeholderOrg] = await Promise.all([
    getDocument<Delivery>(`deliveries/${context.params.deliveryID}`),
    getDocument<Organization>(`orgs/${newStakeholder.orgId}`)
  ]);

  if (!!delivery && !!newStakeholder && !!newStakeholderOrg) {
    const deliveryDoc = await db.doc(`deliveries/${delivery.id}`).get();
    const processedId = deliveryDoc.data()!.processedId;

    if (processedId === context.eventId) {
      return true;
    }

    try {
      const [movie, orgs, stakeholderCount] = await Promise.all([
        getDocument<Movie>(`movies/${delivery.movieId}`),
        getOrgsOfDelivery(delivery.id),
        getCount(`deliveries/${delivery.id}/stakeholders`)
      ]);
      const docID = {id: delivery.id, type: 'delivery'} as DocID;
      const snapInformations = {
        movieTitle: movie!.title.original,
        docID,
        stakeholderId: newStakeholder.id,
        orgName: newStakeholderOrg.name,
        count: stakeholderCount,
        userIds: newStakeholderOrg.userIds
      };

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
  const stakeholder = snap.data();

  if (!stakeholder) {
    throw new Error(`Stakeholder not found !`)
  }

  const [delivery, stakeholderOrg] = await Promise.all([
    getDocument<Delivery>(`deliveries/${context.params.deliveryID}`),
    getDocument<Organization>(`orgs/${stakeholder.orgId}`)
  ]);

  if (!!delivery && !!stakeholder && !!stakeholderOrg) {
    const deliveryDoc = await db.doc(`deliveries/${delivery.id}`).get();
    const processedId = deliveryDoc.data()!.processedId;

    if (processedId === context.eventId) {
      return true;
    }

    try {
      const [movie, orgs] = await Promise.all([
        getDocument<Movie>(`movies/${delivery.movieId}`),
        getOrgsOfDelivery(delivery.id)
      ])

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
  const newStakeholder = snap.data();

  if (!newStakeholder) {
    throw new Error(`New stakeholder not found !`)
  }

  const [movie, newStakeholderOrg] = await Promise.all([
    getDocument<Movie>(`movies/${context.params.movieID}`),
    getDocument<Organization>(`orgs/${newStakeholder.orgId}`)
  ]);

  if (!!movie && !!newStakeholder && !!newStakeholderOrg) {
    const movieDoc = await db.doc(`movies/${movie.id}`).get();
    const processedId = movieDoc.data()!.processedId;

    if (processedId === context.eventId) {
      return true;
    }

    try {
      const [orgs, stakeholderCount] = await Promise.all([
        getOrgsOfMovie(movie.id),
        getCount(`movies/${movie.id}/stakeholders`)
      ]);
      const docID = {id: movie.id, type: 'movie'} as DocID;
      const snapInformations = {
        movieTitle: movie.title.original,
        docID,
        stakeholderId: newStakeholder.id,
        orgName: newStakeholderOrg.name,
        count: stakeholderCount,
        userIds: newStakeholderOrg.userIds
      }

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
  const stakeholder = snap.data();

  if (!stakeholder) {
    throw new Error(`Stakeholder not found !`)
  }

  const [movie, stakeholderOrg] = await Promise.all([
    getDocument<Movie>(`movies/${context.params.movieID}`),
    getDocument<Organization>(`orgs/${stakeholder.orgId}`)
  ]);

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
