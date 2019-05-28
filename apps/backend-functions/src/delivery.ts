import { db, functions } from './firebase';
import { triggerNotifications, prepareNotification } from './notify';
import {
  Organization,
  getDocument,
  getOrgsOfDelivery,
  getCollection,
  Stakeholder,
  Movie,
  Material,
  getCount
} from './utils';

// This string refers to svg icon name
export const APP_DELIVERY_ICON = 'media_delivering';

async function notifyOnNewSignee(delivery: any, orgs: Organization[]): Promise<void> {
  const newStakeholderId = delivery.validated[delivery.validated.length - 1];
  const newStakeholder = await getDocument<Stakeholder>(
    `deliveries/${delivery.id}/stakeholders/${newStakeholderId}`
  );

  if(!newStakeholder) {
    throw new Error(`This stakeholder doesn't exist !`);
  }

  const [newStakeholderOrg, movie] = await Promise.all([
    getDocument<Organization>(`orgs/${newStakeholder!.orgId}`),
    getDocument<Movie>(`movies/${delivery.movieId}`)
  ]);

  if(!movie) {
    throw new Error(`This movie doesn't exist !`);
  }

  if (!newStakeholderOrg) {
    throw new Error(`This organization doesn't exist !`);
  }

  const notifications = orgs
    .filter(org => !!org && !!org.userIds)
    .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
    .map((userId: string) =>
      prepareNotification({
        app: APP_DELIVERY_ICON,
        message: `${newStakeholderOrg.name} signed delivery ${movie.title.original}'s delivery`,
        userId,
        path: `/layout/${delivery.movieId}/${delivery.id}/edit`,
        docID: { id: delivery.id, type: 'delivery' }
      })
    );

  await triggerNotifications(notifications);
}

export async function onDeliveryUpdate(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
) {
  if (!change.after || !change.before) {
    return true;
  }

  const delivery = change.after.data();
  const deliveryBefore = change.before.data();

  if (!delivery || !deliveryBefore) {
    return true;
  }

  /**
   * Note: Google Cloud Function enforces "at least once" delivery for events.
   * This means that an event may processed twice by this function, with the same Before and After data.
   * We store the Google Cloud Funtion's event ID in the delivery, retrieve it and verify that its different
   * betweeen two runs to enforce "only once delivery".
   */
  const deliveryDoc = await db.doc(`deliveries/${delivery.id}`).get();
  const processedId = deliveryDoc.data()!.processedId;

  const [orgs, movie, stakeholderCount] = await Promise.all([
    getOrgsOfDelivery(delivery.id),
    getDocument<Movie>(`movies/${delivery.movieId}`),
    getCount(`deliveries/${delivery.id}/stakeholders`)
  ]);

  /** Notifications are triggered when a new id is pushed into delivery.validated, which is considered as a signature
   *  Note: It doesn't trigger if this is the last signature, as another notification will be sent to notify
   *  that all stakeholders approved the delivery.
   */

  const isNewSignature = delivery.validated.length === deliveryBefore.validated.length + 1;
  const isFullSignatures = delivery.validated.length === stakeholderCount;
  const isBeforeStateClean = deliveryBefore.validated.length === stakeholderCount - 1;

  if (isNewSignature && !isFullSignatures) {
    await notifyOnNewSignee(delivery, orgs);
  }

  if (!isBeforeStateClean || !isFullSignatures) {
    return true;
  }

  if (processedId === context.eventId) {
    return true;
  }

  // When validated.length reaches stakeholderCount.length
  try {
    await db.doc(`deliveries/${delivery.id}`).update({ processedId: context.eventId });
    const [materialsMovie, materialsDelivery] = await Promise.all([
      getCollection<Material>(`movies/${delivery.movieId}/materials`),
      getCollection<Material>(`deliveries/${delivery.id}/materials`)
    ]);

    const promises = materialsDelivery.map(materialDelivery => {
      const materialExist = materialsMovie.find(
        materialMovie =>
          materialDelivery.value === materialMovie.value &&
          materialDelivery.category === materialMovie.category &&
          materialDelivery.description === materialMovie.description
      );

      if (!!materialExist) {
        if (!materialExist.deliveriesIds.includes(delivery.id)) {
          materialExist.deliveriesIds.push(delivery.id);
        }

        const updatedMaterial = { ...materialExist, state: 'pending' };
        return db
          .doc(`movies/${delivery.movieId}/materials/${materialExist.id}`)
          .set(updatedMaterial);
      }
      const material = { ...materialDelivery, deliveriesIds: [delivery.id], state: 'pending' };
      return db.doc(`movies/${delivery.movieId}/materials/${materialDelivery.id}`).set(material);
    });

    // When delivery is signed, we create notifications for each stakeholder
    const notifications = orgs
      .filter(org => !!org && !!org.userIds)
      .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
      .map((userId: string) =>
        prepareNotification({
          app: APP_DELIVERY_ICON,
          message: `${movie!.title.original}'s delivery has been approved by all stakeholders.`,
          userId,
          path: `/layout/${delivery.movieId}/${delivery.id}/view`,
          docID: { id: delivery.id, type: 'delivery' }
        })
      );

    promises.push(triggerNotifications(notifications));
    await Promise.all(promises);
  } catch (e) {
    await db.doc(`deliveries/${delivery.id}`).update({ processedId: null });
    throw e;
  }
  return true;
}
