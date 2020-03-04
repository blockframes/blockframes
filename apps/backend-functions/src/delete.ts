import { db, functions } from './internals/firebase';
import { triggerNotifications, createNotification } from './notification';
import { isTheSame, removeAllSubcollections } from './utils';
import { getCollection, getDocument, getOrganizationsOfDocument } from './data/internals';
import {
  MovieDocument,
  OrganizationDocument,
  DeliveryDocument,
  MaterialDocument
} from './data/types';

export async function deleteFirestoreMovie(
  snap: FirebaseFirestore.DocumentSnapshot
) {
  const movie = snap.data();

  if (!movie) {
    throw new Error(`This movie doesn't exist !`);
  }

  /**
   *  When a movie is deleted, we also delete its sub-collections and references in other collections/documents.
   *  As we delete all deliveries linked to a movie, deliveries sub-collections and references will also be
   *  automatically deleted in the process.
   */

  const batch = db.batch();

  const organizations = await db.collection(`orgs`).get();
  // TODO: .where('movieIds', 'array-contains', movie.id) doesn't seem to work. => ISSUE#908

  organizations.forEach(async doc => {
    const organization = await getDocument<OrganizationDocument>(`orgs/${doc.id}`);

    if (organization.movieIds.includes(movie.id)) {
      console.log(`delete movie id reference in organization ${doc.data().id}`);
      batch.update(doc.ref, {
        movieIds: doc.data().movieIds.filter((movieId: string) => movieId !== movie.id)
      });
    }
  });

  const deliveries = await db.collection(`deliveries`).get();
  // TODO: .where(movie.deliveryIds, 'array-contains', 'id') doesn't seem to work. => ISSUE#908

  deliveries.forEach(doc => {
    if (movie.deliveryIds.includes(doc.data().id)) {
      console.log(`delivery ${doc.id} deleted`);
      batch.delete(doc.ref);
    }
  });

  // Delete sub-collections
  await removeAllSubcollections(snap, batch);
  console.log(`removed sub colletions of ${movie.id}`);
  return batch.commit();
}

export async function deleteFirestoreDelivery(
  snap: FirebaseFirestore.DocumentSnapshot
) {
  const delivery = snap.data();

  if (!delivery) {
    throw new Error(`This delivery doesn't exist !`);
  }

  // We store the organizations before the delivery is deleted
  const organizations = await getOrganizationsOfDocument(delivery.id, 'deliveries');

  const batch = db.batch();

  const movieMaterials = await db.collection(`movies/${delivery.movieId}/materials`).get();
  movieMaterials.forEach(doc => {
    if (doc.data().deliveryIds.includes(delivery.id)) {
      if (doc.data().deliveryIds.length === 1) {
        batch.delete(doc.ref);
      } else {
        batch.update(doc.ref, { deliveryIds: doc.data().deliveryIds.filter((id: string) => id !== delivery.id) });
      }
    }
  });

  const movieDoc = await db.doc(`movies/${delivery.movieId}`).get();
  const movie = await getDocument<MovieDocument>(`movies/${delivery.movieId}`);

  if (!!movieDoc) {
    batch.update(movieDoc.ref, { deliveryIds: movie.deliveryIds.filter((id: string) => id !== delivery.id) });
  }

  // Delete sub-collections
  await removeAllSubcollections(snap, batch);
  await batch.commit();

  // When delivery is deleted, notifications are created for each organization of this delivery
  const notifications = organizations
    .filter(organization => !!organization && !!organization.userIds)
    .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
    .map(userId =>{
      return createNotification({
        userId,
        docId: delivery.id,
        movie: { id: movie.id, title: movie.main.title },
        type: 'deleteDocument',
        app: 'mediaDelivering'
      })
    }
    );

  await triggerNotifications(notifications);

  return true;
}

export async function deleteFirestoreTemplate(
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

/**
 * When a delivery material is deleted, this function will also delete the
 * corresponding material in movie materials if it exists.
 */
export async function deleteFirestoreMaterial(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  const material = snap.data();

  if (!material) {
    throw new Error(`This material doesn't exist !`);
  }

  const delivery = await getDocument<DeliveryDocument>(`deliveries/${context.params.deliveryId}`);

  if (!delivery) {
    throw new Error(`This delivery doesn't exist !`);
  }

  const movieMaterials = await getCollection<MaterialDocument>(`movies/${delivery.movieId}/materials`);

  // As material and movieMaterial don't share the same document ID, we have to look at
  // some property values to find the matching one.
  const movieMaterial = movieMaterials.find(movieMat => isTheSame(movieMat, material as MaterialDocument));

  if (!movieMaterial) {
    throw new Error(`This material doesn't exist on this movie`);
  }

  if (!!movieMaterial.deliveryIds && movieMaterial.deliveryIds.includes(delivery.id)) {
    if (movieMaterial.deliveryIds.length === 1) {
      db.doc(`movies/${delivery.movieId}/materials/${movieMaterial.id}`).delete();
    } else {
      const deliveryIds = movieMaterial.deliveryIds.filter(id => id !== delivery.id);
      db.doc(`movies/${delivery.movieId}/materials/${movieMaterial.id}`).update({ deliveryIds });
    }
  }
  return true;
}
