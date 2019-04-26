import { functions, db } from './firebase';
import { getOrgs, APP_DELIVERY, getDocument } from './delivery';
import { prepareNotification, triggerNotifications } from './notify';

export const onStakeholderCreate = async (
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
      const orgs = await getOrgs(delivery.id);
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

      await triggerNotifications(notifications);
    } catch (e) {
      await db.doc(`deliveries/${delivery.id}`).update({ processedId: null });
      throw e;
    }
    return true;
  }
  return true;
};

export const onStakeholderDelete = async (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) => {
  if (!snap.data()) {
    return true;
  }

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
      const orgs = await getOrgs(delivery.id);
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
