import { functions, db } from './firebase';
import { APP_DELIVERY, getDocument, getCollection } from './delivery';
import { prepareNotification, triggerNotifications } from './notify';

const APP_MOVIE = 'moviefinancing';

export interface Organization {
  userIds: string[];
}

export async function getOrgsOfDelivery(deliveryId: string): Promise<Organization[]> {
  const stakeholders = await getCollection(`deliveries/${deliveryId}/stakeholders`);
  const promises = stakeholders.map(({ orgId }) => db.doc(`orgs/${orgId}`).get());
  const orgs = await Promise.all(promises);
  return orgs.map(doc => doc.data() as Organization);
}

export async function getOrgsOfMovie(movieId: string): Promise<Organization[]> {
  const stakeholders = await getCollection(`deliveries/${movieId}/stakeholders`);
  const promises = stakeholders.map(({ orgId }) => db.doc(`orgs/${orgId}`).get());
  const orgs = await Promise.all(promises);
  return orgs.map(doc => doc.data() as Organization);
}

export const onDeliveryStakeholderCreate = async (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) => {
  if (!snap.data()) {
    return true;
  }

  const delivery = await getDocument(`deliveries/${context.params.deliveryID}`);
  const newStakeholder = snap.data();
  const newStakeholderOrg = await getDocument(`orgs/${newStakeholder!.orgId}`);

  if (!!delivery && !!newStakeholder && !!newStakeholderOrg) {
    const deliveryDoc = await db.doc(`deliveries/${delivery.id}`).get();
    const processedId = deliveryDoc.data()!.processedId;

    if (processedId === context.eventId) {
      return true;
    }

    try {
      const orgs = await getOrgsOfDelivery(delivery.id);
      const notifications = orgs
        .filter(org => !!org && !!org.userIds)
        .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
        .map((userId: string) =>
          prepareNotification({
            app: APP_DELIVERY,
            message: `Stakeholder ${newStakeholder.id} from ${
              newStakeholderOrg.name
            } has been added to delivery ${delivery.id}`,
            userId,
            path: `/layout/${delivery.movieId}/form/${delivery.id}/teamwork`
          })
        );
        // TODO: Make a custom notification for the stakeholder added to this delivery

      await triggerNotifications(notifications);
    } catch (e) {
      await db.doc(`deliveries/${delivery.id}`).update({ processedId: null });
      throw e;
    }
    return true;
  }
  return true;
};

export const onDeliveryStakeholderDelete = async (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) => {
  if (!snap.data()) {
    return true;
  }

  // TODO: Code is very similar to onStakeholderCreate. We should be able to factor some part of it.

  const delivery = await getDocument(`deliveries/${context.params.deliveryID}`);
  const stakeholder = snap.data();
  const stakeholderOrg = await getDocument(`orgs/${stakeholder!.orgId}`);

  if (!!delivery && !!stakeholder && !!stakeholderOrg) {
    const deliveryDoc = await db.doc(`deliveries/${delivery.id}`).get();
    const processedId = deliveryDoc.data()!.processedId;

    if (processedId === context.eventId) {
      return true;
    }

    try {
      const orgs = await getOrgsOfDelivery(delivery.id);
      const notifications = orgs
        .filter(org => !!org && !!org.userIds)
        .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
        .map((userId: string) =>
          prepareNotification({
            app: APP_DELIVERY,
            message: `Stakeholder ${stakeholder.id} from ${
              stakeholderOrg.name
            } has been removed from delivery ${delivery.id}`,
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

export const onMovieStakeholderCreate = async (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) => {
  if (!snap.data()) {
    return true;
  }

  // TODO: Code is very similar to onStakeholderCreate. We should be able to factor some part of it.

  const movie = await getDocument(`movies/${context.params.movieID}`);
  const newStakeholder = snap.data();
  const newStakeholderOrg = await getDocument(`orgs/${newStakeholder!.orgId}`);

  if (!!movie && !!newStakeholder && !!newStakeholderOrg) {
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
            app: APP_MOVIE,
            message: `Stakeholder ${newStakeholder.id} from ${newStakeholderOrg.name}
            has been added to movie ${movie.title.original}`,
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

export const onMovieStakeholderDelete = async (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) => {
  if (!snap.data()) {
    return true;
  }

  // TODO: Code is very similar to onStakeholderCreate. We should be able to factor some part of it.

  const movie = await getDocument(`movies/${context.params.movieID}`);
  const stakeholder = snap.data();
  const stakeholderOrg = await getDocument(`orgs/${stakeholder!.orgId}`);

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
            app: APP_MOVIE,
            message: `Stakeholder ${stakeholder.id} from ${stakeholderOrg.name}
            has been removed from movie ${movie.title.original}`,
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
