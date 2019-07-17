import { functions, db } from './firebase';
import {
  prepareNotification,
  triggerNotifications,
  customMessage,
  prepareInvitation,
  invitationMessage,
  triggerInvitations
} from './notify';
import { getDocument, getCount, getOrganizationsOfDocument } from './data/internals';
import { Delivery, DocInformations, Organization, Movie, SnapObject } from './data/types';

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
    throw new Error(`Snapshot not found`);
  }

  const newStakeholder = snap.data();

  if (!newStakeholder) {
    throw new Error(`New stakeholder not found !`);
  }

  const collection = !!context.params.movieID ? 'movies' : 'deliveries'; // TODO : Change to switch for 3 or more options.
  const document = !!context.params.movieID
    ? await getDocument<any>(`${collection}/${context.params.movieID}`)
    : await getDocument<any>(`${collection}/${context.params.deliveryID}`);
  const docInformations: DocInformations = {
    id: document.id,
    type: !!context.params.movieID ? 'movie' : 'delivery'
  };
  const organization = await getDocument<Organization>(`orgs/${newStakeholder.id}`);

  if (!!document && !!newStakeholder && !!organization) {
    const documentSnapshot = await db.doc(`${collection}/${document.id}`).get();
    const processedId = documentSnapshot.data()!.processedId;

    if (processedId === context.eventId) {
      throw new Error(`Document already processed with this context`);
    }

    try {
      const [organizations, stakeholderCount] = await Promise.all([
        getOrganizationsOfDocument(document.id, collection),
        getCount(`${collection}/${document.id}/stakeholders`)
      ]);
      const movie = !!context.params.movieID
        ? document
        : await getDocument<Movie>(`movies/${document.movieId}`);
      const delivery = !!context.params.deliveryID
        ? await getDocument<Delivery>(`deliveries/${document.id}`)
        : null;
      const snapInformations: SnapObject = {
        movie,
        docInformations,
        organization,
        eventType: context.eventType,
        newStakeholderId: newStakeholder.id,
        count: stakeholderCount,
        delivery
      };

      const notifications = createNotifications(organizations, snapInformations);
      triggerNotifications(notifications);

      const invitations = createInvitations(organizations, snapInformations);
      // TODO: trigger only one invitation shared among all the organization members (loaded with user.orgId in the frontend) => ISSUE#645
      triggerInvitations(invitations);

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
function createNotifications(organizations: Organization[], snap: SnapObject) {
  const path = !!snap.delivery
    ? `/layout/o/${snap.delivery.movieId}/${snap.delivery.id}/teamwork`
    : `/layout/o/home/${snap.movie.id}/teamwork`;
  return organizations
    .filter(organization => !!organization && !!organization.userIds && organization.id !== snap.organization.id)
    .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
    .map(userId => {
      return prepareNotification({
        message: customMessage(snap),
        userId,
        path,
        stakeholderId: snap.newStakeholderId,
        docInformations: snap.docInformations
      });
    });
}

/**
 * Takes a list of Organization and a SnapObject to generate one invitation for each users
 * invited to work on the new document, with custom path and message.
 */
function createInvitations(organizations: Organization[], snap: SnapObject) {
  if (!!snap.count && snap.count > 1) {
    const path = !!snap.delivery
      ? `/layout/o/${snap.delivery.movieId}/${snap.delivery.id}/teamwork`
      : `/layout/o/home/${snap.movie.id}/teamwork`;
    return organizations
      .filter(organization => !!organization && !!organization.userIds && organization.id === snap.organization.id)
      .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
      .map(userId => {
        return prepareInvitation({
          message: invitationMessage(snap),
          userId,
          path,
          stakeholderId: snap.newStakeholderId,
          docInformations: snap.docInformations
        });
      });
  }
  throw new Error('No invitation needed for document owner.');
}
