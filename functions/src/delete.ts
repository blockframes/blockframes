
import {
  db,
  functions
} from './firebase';
import { APP_DELIVERY, getOrgs } from './delivery';
import { prepareNotification, triggerNotifications } from './notify';

export const deleteFirestoreMovie = async (snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) => {
  const movie = snap.data();
  if(!movie) {
    console.error(`This movie doesn\'t exist !`);
    return null;
  }
  const batch = db.batch();
  const stakeholders = await db.collection(`movies/${movie.id}/stakeholders`).get();
  stakeholders.forEach(doc => {
    batch.delete(doc.ref);
  });
  console.log(`${stakeholders.size} stakeholder(s) deleted`)
  const orgs = await db.collection(`orgs`).get();
  orgs.forEach(doc => {
    if (doc.data().movieIds.includes(movie.id)) {
      console.log(`delete movie id reference in org ${doc.data().id}`);
      const newMovieIds: string[] = doc.data().movieIds.filter((movieId: string) => movieId !== movie.id);
      batch.update(doc.ref, {movieIds: newMovieIds});
    }
  });

  const deliveries = await db.collection(`deliveries`).where('movieId', '==', movie.id).get();
  deliveries.forEach(doc => {
    console.log(`delivery ${doc.id} deleted`);
    batch.delete(doc.ref);
  });

  await batch.commit();

  return true;
}

export const deleteFirestoreDelivery = async (snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) => {
  const delivery = snap.data();

  if (!delivery) {
    console.error(`This delivery doesn\'t exist !`);
    return null;
  }

  // we store the orgs before the delivery is deleted
  const orgs = await getOrgs(delivery.id);

  const batch = db.batch();
  const deliveryMaterials = await db.collection(`deliveries/${delivery.id}/materials`).get();
  deliveryMaterials.forEach(doc => batch.delete(doc.ref));

  const stakeholders = await db.collection(`deliveries/${delivery.id}/stakeholders`).get();
  stakeholders.forEach(doc => batch.delete(doc.ref));

  const movieMaterials = await db.collection(`movies/${delivery.movieId}/materials`).get();
  movieMaterials.forEach(doc => {
    if(doc.data().deliveriesIds.includes(delivery.id)) {
      if(doc.data().deliveriesIds.length === 1) batch.delete(doc.ref);
      else {
        const newdeliveriesIds: string[] = doc.data().deliveriesIds.filter((id: string) => id !== delivery.id);
        batch.update(doc.ref, {deliveriesIds: newdeliveriesIds});
      }
    }
  });

  await batch.commit();

  // when delivery is deleted, notifications are created for each stakeholder of this delivery
  const notifications = orgs
    .filter(org => !!org && !!org.userIds)
    .reduce((ids: string[], {userIds}) => [ ...ids, ...userIds ], [])
    .map((userId: string) => prepareNotification({
      app: APP_DELIVERY,
      message: `Delivery with id ${delivery.id} has been deleted.`,
      userId,
      path: null
      })
    );

  await triggerNotifications(notifications);

  return true;
}
