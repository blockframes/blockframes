import { db, functions } from './internals/firebase';
import { customMessage, prepareNotification, triggerNotifications } from './notify';
import { getCount, getDocument, getOrganizationsOfDocument } from './data/internals';
import {
  Delivery,
  DocInformations,
  DocType,
  MovieDocument,
  OrganizationDocument,
  SnapObject,
  Stakeholder
} from './data/types';

const COLLECTION_DELIVERIES = 'deliveries';
const COLLECTION_MOVIES = 'movies';

export async function onDeliveryStakeholderCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  return stakeholdersCollectionEvent(snap, context, COLLECTION_DELIVERIES);
}

export async function onMovieStakeholderCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  return stakeholdersCollectionEvent(snap, context, COLLECTION_MOVIES);
}

export async function onDeliveryStakeholderDelete(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  return stakeholdersCollectionEvent(snap, context, COLLECTION_DELIVERIES);
}

export async function onMovieStakeholderDelete(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  return stakeholdersCollectionEvent(snap, context, COLLECTION_MOVIES);
}

/**
 * Creates custom notifications for users when a new stakeholder, from a delivery or a movie
 * they are working on, is invited. It rely on @param context to check if it is an event
 * from movies or deliveries collection.
 */
async function stakeholdersCollectionEvent(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext,
  collection: string
) {
  const newStakeholder = snap.data() as Stakeholder | undefined;

  if (!newStakeholder) {
    throw new Error(`New stakeholder not found !`);
  }

  // TODO(issue#686): extract semi-generic part, too many if then else, won't work with more types.
  const document = !!context.params.movieID
    ? await getDocument<any>(`${collection}/${context.params.movieID}`)
    : await getDocument<any>(`${collection}/${context.params.deliveryID}`);

  const docInformations: DocInformations = {
    id: document.id,
    type: !!context.params.movieID ? DocType.movie : DocType.delivery
  };

  const organization = await getDocument<OrganizationDocument>(`orgs/${newStakeholder.id}`);

  if (!!document && !!newStakeholder && !!organization) {
    const documentSnapshot = await db.doc(`${collection}/${document.id}`).get();
    const processedId = documentSnapshot.data()!.processedId;

    if (processedId === context.eventId) {
      throw new Error(`Document already processed with this context`);
    }

    try {
      await db
        .doc(`${collection}/${document.id}/stakeholders/${newStakeholder.id}`)
        .update({ processedId: context.eventId });
      const [organizations, stakeholderCount] = await Promise.all([
        getOrganizationsOfDocument(document.id, collection),
        getCount(`${collection}/${document.id}/stakeholders`)
      ]);

      // Retrieve the movie concerned by the event
      const movie = !!context.params.movieID
        ? document
        : await getDocument<MovieDocument>(`movies/${document.movieId}`);

      const delivery = !!context.params.deliveryID
        ? await getDocument<Delivery>(`deliveries/${document.id}`)
        : null;

      const snapInformations: SnapObject = {
        movie,
        docInformations,
        organization,
        eventType: context.eventType,
        count: stakeholderCount,
        delivery
      };

      const notifications = createNotifications(organizations, snapInformations);

      return Promise.all([triggerNotifications(notifications)]);
    } catch (e) {
      await db.doc(`${collection}/${document.id}/stakeholders/${newStakeholder.id}`).update({ processedId: null });
      throw e;
    }
  }
  return true;
}

/**
 * Takes a list of Organization and a SnapObject to generate one notification for each users
 * working on the document, with custom path and message.
 */
function createNotifications(organizations: OrganizationDocument[], snap: SnapObject) {
  const path = !!snap.delivery
    ? `/layout/o/${snap.delivery.movieId}/${snap.delivery.id}/teamwork`
    : `/layout/o/home/${snap.movie.id}/teamwork`;

  const isNotTheInvitedOrganization = (organization: OrganizationDocument): boolean => {
    return !!organization && !!organization.userIds && organization.id !== snap.organization.id;
  };

  return organizations
    .filter(isNotTheInvitedOrganization)
    .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
    .map(userId => {
      return prepareNotification({
        message: customMessage(snap),
        userId,
        path,
        organization: snap.organization,
        docInformations: snap.docInformations
      });
    });
}
