import { db, functions } from './firebase';
import { triggerNotification, prepareNotification } from './notify';

const APP_DELIVERY = 'DELIVERY';

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

async function getOrgs(deliveryId: string): Promise<Organization[]> {
  const stakeholders = await getCollection(`deliveries/${deliveryId}/stakeholders`);
  const organizationsIds = stakeholders.map(x => x.orgId);
  const queryOrgsPromises = organizationsIds.map(id =>
    db
      .collection('orgs')
      .doc(id)
      .get()
  );
  const orgsDoc = await Promise.all(queryOrgsPromises);
  return orgsDoc.map(doc => doc.data() as Organization);
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

  /**
   * Note: Google Cloud Function enforces "at least once" delivery for events.
   * This means that an event may processed twice by this function, with the same Before and After data.
   * We store the Google Cloud Funtion's event ID in the delivery, retrieve it and verify that its different
   * betweeen two runs to enforce "only once delivery".
   */
  const deliveryDoc = await db.doc(`deliveries/${delivery.id}`).get();
  const processedId = deliveryDoc.data()!.processedId;

  if (processedId === context.eventId) {
    return true;
  }

  try {
    await db.doc(`deliveries/${delivery.id}`).update({processedId: context.eventId});
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
      const material = materialExist
        ? { ...materialExist, deliveriesIds: [...(materialExist.delivery || []), delivery.id] }
        : { ...materialDelivery, deliveriesIds: [delivery.id] };
      return db.doc(`movies/${delivery.movieId}/materials/${materialDelivery.id}`).set(material);
    });

    // when delivery is signed, we create notifications for each stakeholder
    const orgs = await getOrgs(delivery.id);
    const userIds: string[] = [];
    orgs.forEach(org => org && org.userIds && userIds.push(...org.userIds));

    const notifications = userIds.map(userId =>
      prepareNotification({
        app: APP_DELIVERY,
        message: `Delivery with id ${delivery.id} has been approved by all stakeholders.`,
        userId
      })
    );

    promises.push(triggerNotification(notifications));
    await Promise.all(promises);
  } catch (e) {
    await db.doc(`deliveries/${delivery.id}`).update({processedId: null});
    throw e;
  }
  return true;
};
