import { flatten, uniqBy } from 'lodash';
import { db, functions } from './internals/firebase';
import { prepareNotification, triggerNotifications } from './notify';
import { getDocument, getOrganizationsOfDocument } from './data/internals';
import { DocType, MaterialDocument, Movie, OrganizationDocument, Delivery, MaterialStatus } from './data/types';
import { isTheSame } from './utils';

export const onMovieMaterialUpdate = async (
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
) => {
  if (!change.after || !change.before) {
    throw new Error('Parameter "change" not found');
  }

  const movie = await getDocument<Movie>(`movies/${context.params.movieID}`);
  const material: MaterialDocument = change.after.data() as MaterialDocument;
  const materialBefore = change.before.data();
  const orgsPromises = material.deliveryIds.map((deliveryId: string) =>
    getOrganizationsOfDocument(deliveryId, 'deliveries')
  );
  const orgsPerDelivery = await Promise.all(orgsPromises);
  const organizations: OrganizationDocument[] = uniqBy(flatten(orgsPerDelivery), 'id');

  if (!material || !materialBefore) {
    console.info('No changes detected on this document');
    return;
  }

  if (material.status === materialBefore.status) {
    console.info('No changes detected on material.status property');
    return;
  }

  /**
   * Note: Google Cloud Function enforces "at least once" delivery for events.
   * This means that an event may processed twice by this function, with the same Before and After data.
   * We store the Google Cloud Funtion's event ID in the delivery, retrieve it and verify that its different
   * betweeen two runs to enforce "only once delivery".
   */
  if (!!movie && !!material && !!organizations) {
    const materialDoc = await db.doc(`movies/${movie.id}/materials/${material.id}`).get();
    const processedId = materialDoc.data()!.processedId;

    if (processedId === context.eventId) {
      console.warn('Document already processed with this context');
      return;
    }

    try {
      const notifications = organizations
        .filter(organization => !!organization && !!organization.userIds)
        .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
        .map((userId: string) =>
          prepareNotification({
            message: `Material : ${material.value} from movie : ${
              movie.main.title.original
            } is now in status : ${material.status}`,
            userId,
            docInformations: { id: material.id, type: DocType.material }
          })
        );

      await triggerNotifications(notifications);
    } catch (error) {
      await db.doc(`movies/${movie.id}/materials/${material.id}`).update({ processedId: null });
      throw error;
    }
    return true;
  }
  return true;
};

/**
 * Copy each delivery Material into the movie materials sub-collection. This checks if the copied Material
 * already exists in the movie before copying it. If so, it just add the delivery.id into material.deliveryIds.
 */
export function copyMaterialsToMovie(
  deliveryMaterials: MaterialDocument[],
  movieMaterials: MaterialDocument[],
  delivery: Delivery
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
  delivery: Delivery
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
