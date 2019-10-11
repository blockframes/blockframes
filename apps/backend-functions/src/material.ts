import { db } from './internals/firebase';
import { MaterialStatus, MaterialDocument, DeliveryDocument } from './data/types';
import { isTheSame } from './utils';

/**
 * Copy each delivery Material into the movie materials sub-collection. This checks if the copied Material
 * already exists in the movie before copying it. If so, it just add the delivery.id into material.deliveryIds.
 */
export function copyMaterialsToMovie(
  deliveryMaterials: MaterialDocument[],
  movieMaterials: MaterialDocument[],
  delivery: DeliveryDocument
) {
  return Promise.all(
    deliveryMaterials.map(deliveryMaterial => {
      return copyMaterialToMovie(deliveryMaterial, movieMaterials, delivery);
    })
  );
}

function copyMaterialToMovie(
  deliveryMaterial: MaterialDocument,
  movieMaterials: MaterialDocument[],
  delivery: DeliveryDocument
) {
  const duplicateMaterial = movieMaterials.find(movieMaterial => isTheSame(movieMaterial, deliveryMaterial));

  if (!!duplicateMaterial) {
    // Check if delivery.id is already in material.deliveriesIds before pushing it in.
    if (!duplicateMaterial.deliveryIds.includes(delivery.id)) {
      duplicateMaterial.deliveryIds.push(delivery.id);
    }

    const updatedMaterial = {
      ...duplicateMaterial,
      status: !!duplicateMaterial.status ? duplicateMaterial.status : MaterialStatus.pending
    };

    return db
      .doc(`movies/${delivery.movieId}/materials/${updatedMaterial.id}`)
      .set(updatedMaterial);
  }
  const material = { ...deliveryMaterial, deliveryIds: [delivery.id], status: 'pending' };
  return db.doc(`movies/${delivery.movieId}/materials/${material.id}`).set(material);
}
