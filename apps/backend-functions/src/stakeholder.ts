import { db, functions } from './internals/firebase';
import { triggerNotifications } from './notification';
import { getDocument, getOrganizationsOfDocument } from './data/internals';
import {
  OrganizationDocument,
  SnapObject,
  MovieDocument,
  StakeholderDocument,
  DeliveryDocument,
  NotificationType,
  createNotification,
  App,
  PublicMovie,
  PublicOrganization
} from './data/types';

export async function onDeliveryStakeholderCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  return stakeholdersCollectionEvent(snap, context);
}

export async function onDeliveryStakeholderDelete(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  return stakeholdersCollectionEvent(snap, context);
}

/**
 * Creates custom notifications for users when a new stakeholder, from a delivery or a movie
 * they are working on, is invited. It rely on @param context to check if it is an event
 * from movies or deliveries collection.
 */
async function stakeholdersCollectionEvent(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) {
  const newStakeholder = snap.data() as StakeholderDocument | undefined;

  if (!newStakeholder) {
    throw new Error(`New stakeholder not found !`);
  }

  // TODO(issue#686): extract semi-generic part, too many if then else, won't work with more types.
  const delivery = await getDocument<DeliveryDocument>(`deliveries/${context.params.deliveryID}`);
  const movie = await getDocument<MovieDocument>(`movies/${delivery.movieId}`);
  const organization = await getDocument<PublicOrganization>(`orgs/${newStakeholder.orgId}`);

  if (!!delivery.id && !!newStakeholder && !!organization) {
    const documentSnapshot = await db.doc(`deliveries/${delivery.id}`).get();
    const processedId = documentSnapshot.data()!.processedId;

    if (processedId === context.eventId) {
      throw new Error(`Document already processed with this context`);
    }

    try {
      await db
        .doc(`deliveries/${delivery.id}/stakeholders/${newStakeholder.orgId}`)
        .update({ processedId: context.eventId });
      const organizationsOfDocument = await getOrganizationsOfDocument(delivery.id, 'deliveries');

      const type =
        context.eventType === 'google.firestore.document.create'
          ? NotificationType.inviteOrganization
          : NotificationType.removeOrganization;

      const snapObject: SnapObject = {
        organization: { id: organization.id, name: organization.name } as PublicOrganization,
        movie: { id: movie.id, title: movie.main.title } as PublicMovie,
        docId: delivery.id,
        type
      };

      // Remove stakeholder id reference from delivery's stakeholderIds array.
      // Remove documentPermissions for this delivery.
      if (type === NotificationType.removeOrganization) {
        await db.doc(`deliveries/${delivery.id}`).update({
          stakeholderIds: delivery.stakeholderIds.filter((id: string) => id !== newStakeholder.orgId)
        });
        await db.doc(`permissions/${newStakeholder.orgId}/documentPermissions/${delivery.id}`).delete();
      }

      const notifications = createNotifications(organizationsOfDocument, snapObject);

      return Promise.all([triggerNotifications(notifications)]);
    } catch (e) {
      await db
        .doc(`deliveries/${delivery.id}/stakeholders/${newStakeholder.orgId}`)
        .update({ processedId: null });
      throw e;
    }
  }
  return true;
}

/**
 * Takes a list of Organization and a SnapObject to generate one notification for each users
 * working on the document, with custom path and message.
 */
function createNotifications(
  organizationsOfDocument: OrganizationDocument[],
  snapObject: SnapObject
) {
  const isNotTheInvitedOrganization = (organizationOfDocument: OrganizationDocument): boolean => {
    return (
      !!snapObject.organization &&
      !!organizationOfDocument.userIds &&
      organizationOfDocument.id !== snapObject.organization.id
    );
  };

  return organizationsOfDocument
    .filter(isNotTheInvitedOrganization)
    .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
    .map(userId => {
      return createNotification({
        userId,
        organization: snapObject.organization,
        movie: snapObject.movie,
        app: App.mediaDelivering,
        type: snapObject.type,
        docId: snapObject.docId,
        app: App.mediaDelivering
      });
    });
}
