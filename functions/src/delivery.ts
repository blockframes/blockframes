import { db, functions } from './firebase';
import { triggerNotifications, prepareNotification } from './notify';

export const APP_DELIVERY = 'delivery'; // This string refers to svg icon name

interface Organization {
  userIds: string[];
}

//Functions
function getCollection(path: string) {
  return db
    .collection(path)
    .get()
    .then(collection => collection.docs.map(doc => doc.data()));
}

function getDocument(path: string) {
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

  const newSigneeNotifications = orgs
    .filter(org => !!org && !!org.userIds)
    .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
    .map((userId: string) =>
      prepareNotification({
        app: APP_DELIVERY,
        message: `Stakeholder ${newStakeholderOrg!.name} with id ${
          newStakeholder!.id
        } signed delivery ${delivery.id}`,
        userId,
        path: `/layout/${delivery.movieId}/form/${delivery.id}`
      })
    );

  await triggerNotifications(newSigneeNotifications);
}

export async function getOrgs(deliveryId: string): Promise<Organization[]> {
  const stakeholders = await getCollection(`deliveries/${deliveryId}/stakeholders`);
  const promises = stakeholders.map(({ orgId }) => db.doc(`orgs/${orgId}`).get());
  const orgs = await Promise.all(promises);
  return orgs.map(doc => doc.data() as Organization);
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

  const orgs = await getOrgs(delivery.id);

  // Notifications are triggered when a new id is pushed into delivery.validated, which is considered as a signature
  if (delivery.validated.length === deliveryBefore.validated.length + 1) {
    await notifyOnNewSignee(delivery, orgs);
  }

  const stakeholderCount = await db
    .collection(`deliveries/${delivery.id}/stakeholders`)
    .get()
    .then(snap => snap.size);
  // when validated.length reaches stakeholderCount.length
  if (
    deliveryBefore.validated.length !== stakeholderCount - 1 ||
    delivery.validated.length !== stakeholderCount
  ) {
    return true;
  }

  if (processedId === context.eventId) {
    return true;
  }

  try {
    await db.doc(`deliveries/${delivery.id}`).update({ processedId: context.eventId });
    const [materialsMovie, materialsDelivery] = await Promise.all([
      getCollection(`movies/${delivery.movieId}/materials`),
      getCollection(`deliveries/${delivery.id}/materials`)
    ]);

    const promises = materialsDelivery.map(materialDelivery => {
      const materialExist = materialsMovie.find(
        materialMovie =>
          materialDelivery.value === materialMovie.value &&
          materialDelivery.category === materialMovie.category &&
          materialDelivery.description === materialMovie.description
      );
      if (!!materialExist) {
        materialExist.deliveriesIds.push(delivery.id);
        return db
          .doc(`movies/${delivery.movieId}/materials/${materialExist.id}`)
          .set(materialExist);
      }
      const material = { ...materialDelivery, deliveriesIds: [delivery.id] };
      return db.doc(`movies/${delivery.movieId}/materials/${materialDelivery.id}`).set(material);
    });

    // when delivery is signed, we create notifications for each stakeholder
    const approvedDeliveryNotifications = orgs
      .filter(org => !!org && !!org.userIds)
      .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
      .map((userId: string) =>
        prepareNotification({
          app: APP_DELIVERY,
          message: `Delivery with id ${delivery.id} has been approved by all stakeholders.`,
          userId,
          path: `/layout/${delivery.movieId}/view/${delivery.id}`
        })
      );

    promises.push(triggerNotifications(approvedDeliveryNotifications));
    await Promise.all(promises);
  } catch (e) {
    await db.doc(`deliveries/${delivery.id}`).update({ processedId: null });
    throw e;
  }
  return true;
};
