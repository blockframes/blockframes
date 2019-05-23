import { flatten, uniqBy } from 'lodash';
import { db, functions } from './firebase';
import { APP_DELIVERY_ICON } from './delivery';
import { triggerNotifications, prepareNotification } from './notify';
import { getDocument, getOrgsOfDelivery, Organization } from './utils';

export interface Material {
  id: string;
  value: string;
  deliveriesIds: string[];
  state: string;
}

export const onMaterialUpdate = async (
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
) => {
  if (!change.after || !change.before) {
    return true;
  }

  const movie = await getDocument(`movies/${context.params.movieID}`);
  const material: Material = change.after.data() as Material;
  const materialBefore = change.before.data();
  const orgsPromises = material.deliveriesIds.map((deliveryId: string) =>
    getOrgsOfDelivery(deliveryId)
  );
  const orgsPerDelivery = await Promise.all(orgsPromises);
  const orgs : Organization[] = uniqBy(flatten(orgsPerDelivery), 'id');

  if (!material || !materialBefore) {
    return true;
  }

  if (material.state === materialBefore.state) {
    return true;
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
      return true;
    }

    try {
      const notifications = orgs
        .filter((org: Organization) => !!org && !!org.userIds)
        .reduce((ids: string[], { userIds }: Organization): string[] => {
          return [...ids, ...userIds];
        }, [])
        .map((userId: string) =>
          prepareNotification({
            app: APP_DELIVERY_ICON,
            message: `Material : ${material.value} from movie : ${
              movie.title.original
            } is now in state : ${material.state}`,
            userId,
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
