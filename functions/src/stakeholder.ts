import { functions, db } from './firebase';
import { APP_DELIVERY_ICON, getDocument, getCollection } from './delivery';
import { prepareNotification, triggerNotifications, Doc } from './notify';

const APP_MOVIE_ICON = 'moviefinancing';

export interface Organization {
  userIds: string[];
}

interface snapObject {
  doc: Doc,
  stakeholderId: string,
  orgName: string,
  count: number,
  userIds: string[]
}

export async function getOrgsOfDelivery(deliveryId: string): Promise<Organization[]> {
  const stakeholders = await getCollection(`deliveries/${deliveryId}/stakeholders`);
  const promises = stakeholders.map(({ orgId }) => db.doc(`orgs/${orgId}`).get());
  const orgs = await Promise.all(promises);
  return orgs.map(doc => doc.data() as Organization);
}

export async function getOrgsOfMovie(movieId: string): Promise<Organization[]> {
  const stakeholders = await getCollection(`movies/${movieId}/stakeholders`);
  const promises = stakeholders.map(({ orgId }) => db.doc(`orgs/${orgId}`).get());
  const orgs = await Promise.all(promises);
  return orgs.map(doc => doc.data() as Organization);
}

function customMessage(userId: string, snapInformations: snapObject) {
  return snapInformations.userIds.includes(userId) && snapInformations.count > 1
    ? `You have been invited to ${snapInformations.doc.type} : ${snapInformations.doc.id}. Do you wish to work on it ?`
    : `Stakeholder ${snapInformations.stakeholderId} from ${
      snapInformations.orgName
    } has been added to ${snapInformations.doc.type} : ${snapInformations.doc.id}`;
}

function getCount(collection: string) {
  return db.collection(collection).get().then(col => col.size)
}

export async function onDeliveryStakeholderCreate (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
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
      const doc = {id: delivery.id, type: 'delivery'} as Doc;
      const stakeholderCount = await getCount(`deliveries/${delivery.id}/stakeholders`)
      const snapInformations = {
        doc,
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
            doc,
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
            app: APP_DELIVERY_ICON,
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

export async function onMovieStakeholderCreate (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
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
      const doc = {id: movie.id, type: 'movie'} as Doc;
      const stakeholderCount = await getCount(`movies/${movie.id}/stakeholders`)
      const snapInformations = {
        doc,
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
            doc,
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
            app: APP_MOVIE_ICON,
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
