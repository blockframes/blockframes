import { flatten, uniqBy } from 'lodash';
import { db, functions } from './internals/firebase';
import { prepareNotification, triggerNotifications } from './notify';
import { getDocument, getOrganizationsOfDocument } from './data/internals';
import { DocType, Material, Movie, Organization } from './data/types';

export const onMaterialUpdate = async (
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
) => {
  if (!change.after || !change.before) {
    throw new Error(`Parameter 'change' not found`);
  }

  const movie = await getDocument<Movie>(`movies/${context.params.movieID}`);
  const material: Material = change.after.data() as Material;
  const materialBefore = change.before.data();
  const orgsPromises = material.deliveriesIds.map((deliveryId: string) =>
    getOrganizationsOfDocument(deliveryId, 'deliveries')
  );
  const orgsPerDelivery = await Promise.all(orgsPromises);
  const organizations : Organization[] = uniqBy(flatten(orgsPerDelivery), 'id');

  if (!material || !materialBefore) {
    console.info(`No changes detected on this document`);
    return;
  }

  if (material.state === materialBefore.state) {
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
      console.warn("Document already processed with this context");
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
            } is now in state : ${material.state}`,
            userId,
            docInformations: { id: material.id, type: DocType.material },
            path: `/layout/${movie.id}/view/${material.deliveriesIds[0]}`
            // mocked path using first delivery in array
          })
        );

      await triggerNotifications(notifications);
    } catch (e) {
      await db.doc(`movies/${movie.id}/materials/${material.id}`).update({ processedId: null });
      throw e;
    }
    return true;
  }
  return true;
};
