import { flatten, uniqBy } from 'lodash';
import { db, functions } from './internals/firebase';
import { prepareNotification, triggerNotifications } from './notify';
import { getDocument, getOrganizationsOfDocument, getCollection } from './data/internals';
import { DocType, Material, Movie, Organization, Delivery, MaterialStatus } from './data/types';
import { isTheSame } from './utils';

export const onMovieMaterialUpdate = async (
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
) => {
  if (!change.after || !change.before) {
    throw new Error(`Parameter 'change' not found`);
  }

  const movie = await getDocument<Movie>(`movies/${context.params.movieID}`);
  const material: Material = change.after.data() as Material;
  const materialBefore = change.before.data();
  const orgsPromises = material.deliveryIds.map((deliveryId: string) =>
    getOrganizationsOfDocument(deliveryId, 'deliveries')
  );
  const orgsPerDelivery = await Promise.all(orgsPromises);
  const organizations: Organization[] = uniqBy(flatten(orgsPerDelivery), 'id');

  if (!material || !materialBefore) {
    console.info(`No changes detected on this document`);
    return;
  }


  if (material.status === materialBefore.status) {
    console.info(`No changes detected on material.state property`);
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
            docInformations: { id: material.id, type: DocType.material },
            path: `/layout/${movie.id}/view/${material.deliveryIds[0]}`
            // mocked path using first delivery in array
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

export const onDeliveryMaterialUpdate = async (
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
) => {
  if (!change.after || !change.before) {
    throw new Error(`Parameter 'change' not found`);
  }

  const delivery = await getDocument<Delivery>(`deliveries/${context.params.deliveryID}`);
  const material: Material = change.after.data() as Material;
  const materialBefore = change.before.data();

  if (delivery.deliveryListToBeSigned) {
    console.warn('Can\'t copy materials from a delivery to be signed');
    return;
  }

  if (!material || !materialBefore) {
    console.info(`No changes detected on this document`);
    return;
  }

  /**
   * Note: Google Cloud Function enforces "at least once" delivery for events.
   * This means that an event may processed twice by this function, with the same Before and After data.
   * We store the Google Cloud Funtion's event ID in the delivery, retrieve it and verify that its different
   * betweeen two runs to enforce "only once delivery".
   */
  if (!!delivery && !!material) {
    const materialDoc = await db.doc(`deliveries/${delivery.id}/materials/${material.id}`).get();
    const processedId = materialDoc.data()!.processedId;

    if (processedId === context.eventId) {
      console.warn('Document already processed with this context');
      return;
    }

    try {

      const [materialsMovie, materialsDelivery] = await Promise.all([
        getCollection<Material>(`movies/${delivery.movieId}/materials`),
        getCollection<Material>(`deliveries/${delivery.id}/materials`)
      ]);

      copyMaterialsToMovie(materialsDelivery, materialsMovie, delivery);

    } catch (error) {
      await db
        .doc(`deliveries/${delivery.id}/materials/${material.id}`)
        .update({ processedId: null });
      throw error;
    }
    return true;
  }
  return true;
};

export const onDeliveryMaterialCreate = async (
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) => {
  const material = snap.data() as Material | undefined;

  if (!material) {
    throw new Error(`New stakeholder not found !`);
  }

  const delivery = await getDocument<Delivery>(`deliveries/${context.params.deliveryID}`);

  if (delivery.deliveryListToBeSigned) {
    console.warn('Can\'t copy materials from a delivery to be signed');
    return;
  }

  /**
   * Note: Google Cloud Function enforces "at least once" delivery for events.
   * This means that an event may processed twice by this function, with the same Before and After data.
   * We store the Google Cloud Funtion's event ID in the delivery, retrieve it and verify that its different
   * betweeen two runs to enforce "only once delivery".
   */
  if (!!delivery && !!material) {
    const materialDoc = await db.doc(`deliveries/${delivery.id}/materials/${material.id}`).get();
    const processedId = materialDoc.data()!.processedId;

    if (processedId === context.eventId) {
      console.warn('Document already processed with this context');
      return;
    }

    try {

      const [materialsMovie, materialsDelivery] = await Promise.all([
        getCollection<Material>(`movies/${delivery.movieId}/materials`),
        getCollection<Material>(`deliveries/${delivery.id}/materials`)
      ]);

      copyMaterialsToMovie(materialsDelivery, materialsMovie, delivery);

    } catch (error) {
      await db
        .doc(`deliveries/${delivery.id}/materials/${material.id}`)
        .update({ processedId: null });
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
  deliveryMaterials: Material[],
  movieMaterials: Material[],
  delivery: Delivery
) {
  return deliveryMaterials.map(deliveryMaterial => {
    const duplicateMaterial = movieMaterials.find(movieMaterial =>
      isTheSame(movieMaterial, deliveryMaterial)
    );

    if (!!duplicateMaterial) {
      console.log(duplicateMaterial)
      // Check if delivery.id is already in material.deliveryIds before pushing it in.
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
    const material = { ...deliveryMaterial, deliveryIds: [delivery.id], status: MaterialStatus.pending };
    return db.doc(`movies/${delivery.movieId}/materials/${material.id}`).set(material);
  });
}
