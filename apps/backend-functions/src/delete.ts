import { db, functions } from './firebase';
import { prepareNotification, triggerNotifications } from './notify';
import { getDocument, Delivery, Material, getCollection, isTheSame, getOrgsOfDocument } from './utils';

export async function deleteFirestoreMovie (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  const movie = snap.data();

  if (!movie) {
    throw new Error(`This movie doesn\'t exist !`);
  }

  /**
   *  When a movie is deleted, we also delete its sub-collections and references in other collections/documents.
   *  As we delete all deliveries linked to a movie, deliveries sub-collections and references will also be
   *  automatically deleted in the process.
   */

  const batch = db.batch();
  const stakeholders = await db.collection(`movies/${movie.id}/stakeholders`).get();
  stakeholders.forEach(doc => {
    batch.delete(doc.ref);
  });
  console.log(`${stakeholders.size} stakeholder(s) deleted`);
  const orgs = await db.collection(`orgs`).get();
  orgs.forEach(doc => {
    if (doc.data().movieIds.includes(movie.id)) {
      console.log(`delete movie id reference in org ${doc.data().id}`);
      const newMovieIds: string[] = doc
        .data()
        .movieIds.filter((movieId: string) => movieId !== movie.id);
      batch.update(doc.ref, { movieIds: newMovieIds });
    }
  });

  const deliveries = await db
    .collection(`deliveries`)
    .where('movieId', '==', movie.id)
    .get();
  deliveries.forEach(doc => {
    console.log(`delivery ${doc.id} deleted`);
    batch.delete(doc.ref);
  });

  await batch.commit();

  return true;
};

export async function deleteFirestoreDelivery (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  const delivery = snap.data();

  if (!delivery) {
    throw new Error(`This delivery doesn't exist !`);
  }

  // We store the orgs before the delivery is deleted
  const orgs = await getOrgsOfDocument(delivery.id, 'deliveries');

  const batch = db.batch();
  const deliveryMaterials = await db.collection(`deliveries/${delivery.id}/materials`).get();
  deliveryMaterials.forEach(doc => batch.delete(doc.ref));

  const stakeholders = await db.collection(`deliveries/${delivery.id}/stakeholders`).get();
  stakeholders.forEach(doc => batch.delete(doc.ref));

  const movieMaterials = await db.collection(`movies/${delivery.movieId}/materials`).get();
  movieMaterials.forEach(doc => {
    if (doc.data().deliveriesIds.includes(delivery.id)) {
      if (doc.data().deliveriesIds.length === 1) batch.delete(doc.ref);
      else {
        const newdeliveriesIds = doc
          .data()
          .deliveriesIds.filter((id: string) => id !== delivery.id);
        batch.update(doc.ref, { deliveriesIds: newdeliveriesIds });
      }
    }
  });

  await batch.commit();

  // When delivery is deleted, notifications are created for each stakeholder of this delivery
  const notifications = orgs
    .filter(org => !!org && !!org.userIds)
    .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
    .map((userId: string) =>
      prepareNotification({
        message: `Delivery with id ${delivery.id} has been deleted.`,
        userId,
        docID: {id: delivery.id, type: 'delivery'}
      })
    );

  await triggerNotifications(notifications);

  return true;
};

export async function deleteFirestoreTemplate (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  const template = snap.data();

  if (!template) {
    throw new Error(`This template doesn't exist !`);
  }

  const batch = db.batch();
  const templateMaterials = await db.collection(`templates/${template.id}/materials`).get();
  templateMaterials.forEach(doc => batch.delete(doc.ref));

  return batch.commit();

}

export async function deleteFirestoreMaterial (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  const material = snap.data();

  if (!material) {
    throw new Error(`This material doesn't exist !`);
  }

  const delivery = await getDocument<Delivery>(`deliveries/${context.params.deliveryId}`);

  if (!delivery) {
    throw new Error(`This delivery doesn't exist !`);
  }

  const movieMaterials = await getCollection<Material>(`movies/${delivery.movieId}/materials`);

  // As material and movieMaterial don't share the same document ID, we have to look at
  // some property values to find the matching one.
  const movieMaterial = movieMaterials.find(
    movieMat => isTheSame(movieMat, material as Material)
  );

  if (!movieMaterial) {
    throw new Error(`This material doesn't exist on this movie`);
  }

  if (movieMaterial.deliveriesIds.includes(delivery.id)) {
    if (movieMaterial.deliveriesIds.length === 1) {
      db.doc(`movies/${delivery.movieId}/materials/${movieMaterial.id}`).delete()
    }
    else {
      const newdeliveriesIds = movieMaterial.deliveriesIds.filter((id: string) => id !== delivery.id);
      db.doc(`movies/${delivery.movieId}/materials/${movieMaterial.id}`)
        .update({ deliveriesIds: newdeliveriesIds });
    }
  }
  return true;
};
