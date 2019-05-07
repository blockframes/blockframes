import { db, functions } from './firebase';
import { triggerNotifications, prepareNotification } from './notify';
import { getOrgsOfDelivery, Organization } from './stakeholder';

// This string refers to svg icon name
export const APP_DELIVERY_ICON = 'delivery';

export async function getCollection(path: string) {
  return db
    .collection(path)
    .get()
    .then(collection => collection.docs.map(doc => doc.data()));
}

export async function getDocument(path: string) {
  return db
    .doc(path)
    .get()
    .then(doc => doc.data());
}

async function notifyOnNewSignee(delivery: any, orgs: Organization[]): Promise<void> {
  const newStakeholderId = delivery.validated[delivery.validated.length - 1];
  const newStakeholder = await getDocument(
    `deliveries/${delivery.id}/stakeholders/${newStakeholderId}`
  );
  const newStakeholderOrg = await getDocument(`orgs/${newStakeholder!.orgId}`);

  const notifications = orgs
    .filter(org => !!org && !!org.userIds)
    .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
    .map((userId: string) =>
      prepareNotification({
        app: APP_DELIVERY_ICON,
        message: `Stakeholder ${newStakeholder!.id}
        from ${newStakeholderOrg!.name}
        signed delivery ${delivery.id}`,
        userId,
        path: `/layout/${delivery.movieId}/form/${delivery.id}`,
        docID: {id: delivery.id, type: 'delivery'}
      })
    );

  return triggerNotifications(notifications);
}

export const onDeliveryUpdate = async (
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
) => {
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

  const orgs = await getOrgsOfDelivery(delivery.id);
  const stakeholderCount = await db
    .collection(`deliveries/${delivery.id}/stakeholders`).where('isAccepted', '==', true)
    .get()
    .then(snap => snap.size);

  /** Notifications are triggered when a new id is pushed into delivery.validated, which is considered as a signature
   *  Note: It doesn't trigger if this is the last signature, as another notification will be sent to notify
   *  that all stakeholders approved the delivery.
   */

  const isNewSignature = delivery.validated.length === deliveryBefore.validated.length;
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
      getCollection(`movies/${delivery.movieId}/materials`),
      getCollection(`deliveries/${delivery.id}/materials`)
    ]);

    const promises = materialsDelivery.map(materialDelivery => {
      console.log(materialDelivery)
      const materialExist = materialsMovie.find(
        materialMovie =>
          materialDelivery.value === materialMovie.value &&
          materialDelivery.category === materialMovie.category &&
          materialDelivery.description === materialMovie.description
      );
      if (!!materialExist) {
        materialExist.deliveriesIds.push(delivery.id);
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
          message: `Delivery with id ${delivery.id} has been approved by all stakeholders.`,
          userId,
          path: `/layout/${delivery.movieId}/view/${delivery.id}`,
          docID: {id: delivery.id, type: 'delivery'}
        })
      );

    promises.push(triggerNotifications(notifications));
    await Promise.all(promises);
  } catch (e) {
    await db.doc(`deliveries/${delivery.id}`).update({ processedId: null });
    throw e;
  }
  return true;
};
