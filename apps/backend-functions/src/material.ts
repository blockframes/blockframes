import { flatten, uniqBy } from 'lodash';
import { db, functions } from './firebase';
import { triggerNotifications, prepareNotification } from './notify';
import { getDocument, getOrgsOfDocument } from './data/internals';
import { Organization, Material, Movie } from './data/types';

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
    getOrgsOfDocument(deliveryId, 'deliveries')
  );
  const orgsPerDelivery = await Promise.all(orgsPromises);
  const orgs : Organization[] = uniqBy(flatten(orgsPerDelivery), 'id');

  if (!material || !materialBefore) {
    throw new Error(`No changes detected on this document`);
  }

  if (material.state === materialBefore.state) {
    throw new Error(`No changes detected on material.state property`);
  }

  /**
   * Note: Google Cloud Function enforces "at least once" delivery for events.
   * This means that an event may processed twice by this function, with the same Before and After data.
   * We store the Google Cloud Funtion's event ID in the delivery, retrieve it and verify that its different
   * betweeen two runs to enforce "only once delivery".
   */
  if (!!movie && !!material && !!orgs) {
    const materialDoc = await db.doc(`movies/${movie.id}/materials/${material.id}`).get();
    const processedId = materialDoc.data()!.processedId;

    if (processedId === context.eventId) {
      throw new Error(`Document already processed with this context`);
    }

    try {
      const notifications = orgs
        .filter((org: Organization) => !!org && !!org.userIds)
        .reduce((ids: string[], { userIds }: Organization): string[] => {
          return [...ids, ...userIds];
        }, [])
        .map((userId: string) =>
          prepareNotification({
            message: `Material : ${material.value} from movie : ${
              movie.title.original
            } is now in state : ${material.state}`,
            userId,
            docID: {id: material.id, type: 'material'},
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
