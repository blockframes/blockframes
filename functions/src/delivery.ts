import { db, functions } from './firebase';
import { triggerNotification, prepareNotification } from './notify';

const APP_DELIVERY = 'DELIVERY';

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

  const queryStakeholdersCount = await db
    .collection(`deliveries/${delivery.id}/stakeholders`)
    .get();
  const stakeholderCount = queryStakeholdersCount.docs.map(doc => doc.data());
  // when validated.length reaches stakeholderCount.length
  if (
    deliveryBefore.validated.length === stakeholderCount.length - 1 &&
    delivery.validated.length === stakeholderCount.length
  ) {
    const queryMovie = await db.collection(`movies/${delivery.movieId}/materials`).get();
    const materialsMovie = queryMovie.docs.map(doc => doc.data());

    const queryDelivery = await db.collection(`deliveries/${delivery.id}/materials`).get();
    const materialsDelivery = queryDelivery.docs.map(doc => doc.data());

    const promises: Promise<any>[] = [];

    materialsDelivery.forEach(materialDelivery => {
      const materialExist = materialsMovie.find(
        materialMovie =>
          materialDelivery.value === materialMovie.value &&
          materialDelivery.category === materialMovie.category &&
          materialDelivery.description === materialMovie.description
      );

      if (materialExist) {
        // when material exists in movie, we update the existing material 'deliveriesIds' property
        materialExist.deliveriesIds.push(delivery.id);
        const promise = db
          .doc(`movies/${delivery.movieId}/materials/${materialExist.id}`)
          .set(materialExist);
        promises.push(promise);
      } else {
        // when material does not exist in movie, we make a copy of that material in the movie subcollection
        const promise = db
          .doc(`movies/${delivery.movieId}/materials/${materialDelivery.id}`)
          .set({ ...materialDelivery, deliveriesIds: [delivery.id] });
        promises.push(promise);
      }
    });

    // when delivery is signed, we create notifications for each stakeholder
    const queryStakeholders = await db.collection(`deliveries/${delivery.id}/stakeholders`).get();
    const stakeholders = queryStakeholders.docs.map(doc => doc.data());

    const notifications = stakeholders.map(stakeholder =>
      prepareNotification({
        app: APP_DELIVERY,
        message: `Delivery with id ${delivery.id} has been approved by all stakeholders.`,
        orgId: stakeholder.orgId
      })
    );

    promises.push(triggerNotification(notifications));
    await Promise.all(promises);
  }

  return true;
};
