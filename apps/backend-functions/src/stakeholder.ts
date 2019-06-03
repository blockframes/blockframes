import { functions, db } from './firebase';
import { prepareNotification, triggerNotifications, customMessage } from './notify';
import {
  getDocument,
  getCount,
  Delivery,
  DocID,
  Organization,
  Movie,
  SnapObject,
  getOrgsOfDocument
} from './utils';

export async function onDeliveryStakeholderCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  stakeholdersCollectionEvent(snap, context);
}

export async function onMovieStakeholderCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  stakeholdersCollectionEvent(snap, context);
}

export async function onDeliveryStakeholderDelete(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  stakeholdersCollectionEvent(snap, context);
}

export async function onMovieStakeholderDelete(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  stakeholdersCollectionEvent(snap, context);
}

/**
 * Create custom notifications for users when a new stakeholder, from a delivery or a movie
 * they are working on, is invited. It rely on @param context to check if it is an event
 * from movies or deliveries collection.
 */
async function stakeholdersCollectionEvent(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  if (!snap.data()) {
    return true;
  }

  const newStakeholder = snap.data();

  if (!newStakeholder) {
    throw new Error(`New stakeholder not found !`);
  }

  const collection = !!context.params.movieID ? 'movies' : 'deliveries';
  const document = !!context.params.movieID
    ? await getDocument<any>(`${collection}/${context.params.movieID}`)
    : await getDocument<any>(`${collection}/${context.params.deliveryID}`);
  const docID: DocID = {
    id: document.id,
    type: !!context.params.movieID ? 'movie' : 'delivery'
  };
  const newStakeholderOrg = await getDocument<Organization>(`orgs/${newStakeholder.orgId}`);

  if (!!document && !!newStakeholder && !!newStakeholderOrg) {
    const documentSnapshot = await db.doc(`${collection}/${document.id}`).get();
    const processedId = documentSnapshot.data()!.processedId;

    if (processedId === context.eventId) {
      return true;
    }

    try {
      const [orgs, stakeholderCount] = await Promise.all([
        getOrgsOfDocument(document.id, collection),
        getCount(`${collection}/${document.id}/stakeholders`)
      ]);
      const snapInformations: SnapObject = {
        movie: !!context.params.movieID
          ? document
          : await getDocument<Movie>(`movies/${document.movieId}`),
        docID,
        org: newStakeholderOrg,
        eventType: context.eventType,
        newStakeholderId: newStakeholder.id,
        count: stakeholderCount,
        delivery: !!context.params.deliveryID
          ? await getDocument<Delivery>(`deliveries/${document.id}`)
          : null
      };

      const notifications = createStakeholderNotifications(orgs, snapInformations);

      await triggerNotifications(notifications);
    } catch (e) {
      await db.doc(`${collection}/${document.id}`).update({ processedId: null });
      throw e;
    }
    return true;
  }
  return true;
}

/**
 * Takes a list of Organization and a SnapObject to generate one notification for each users
 * working on the document, with custom path and message.
 */
function createStakeholderNotifications(orgs: Organization[], snap: SnapObject) {
  return orgs
    .filter(org => !!org && !!org.userIds)
    .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
    .map((userId: string) => {
      const path = !!snap.delivery
        ? `/layout/${snap.delivery.movieId}/${snap.delivery.id}/teamwork`
        : `/layout/home/form/${snap.movie.id}/teamwork`;
      return prepareNotification({
        message: customMessage(userId, snap),
        userId,
        path,
        stakeholderId: snap.newStakeholderId,
        docID: snap.docID
      });
    });
}
