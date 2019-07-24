import { db, functions } from './internals/firebase';
import {
  customMessage,
  prepareNotification,
  prepareStakeholderInvitation,
  triggerInvitations,
  triggerNotifications
} from './notify';
import { getCount, getDocument, getOrganizationsOfDocument } from './data/internals';
import {
  App,
  Delivery,
  DocInformations,
  DocType,
  InvitationStakeholder,
  Movie,
  Organization,
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
 * Create custom notifications for users when a new stakeholder, from a delivery or a movie
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

  // TODO: extract semi-generic part, too many if then else, won't work with more types.
  const document = !!context.params.movieID
    ? await getDocument<any>(`${collection}/${context.params.movieID}`)
    : await getDocument<any>(`${collection}/${context.params.deliveryID}`);

  const docInformations: DocInformations = {
    id: document.id,
    type: !!context.params.movieID ? DocType.movie : DocType.delivery
  };

  const organization = await getDocument<Organization>(`orgs/${newStakeholder.id}`);

  if (!!document && !!newStakeholder && !!organization) {
    const documentSnapshot = await db.doc(`${collection}/${document.id}`).get();
    const processedId = documentSnapshot.data()!.processedId;

    if (processedId === context.eventId) {
      throw new Error(`Document already processed with this context`);
    }
    // TODO: set processed Id to prevent duplicates firebase functions events.

    try {
      const [organizations, stakeholderCount] = await Promise.all([
        getOrganizationsOfDocument(document.id, collection),
        getCount(`${collection}/${document.id}/stakeholders`)
      ]);

      // Retrieve the movie concerned by the event
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
      const invitation = createInvitation(organizations, snapInformations);

      // TODO: trigger only one invitation shared among all the organization members (loaded with user.orgId in the frontend) => ISSUE#645
      return await Promise.all([
        triggerInvitations([invitation]),
        triggerNotifications(notifications)
      ]);
    } catch (e) {
      await db.doc(`${collection}/${document.id}`).update({ processedId: null });
      throw e;
    }
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

  const isNotTheInvitedMember = (organization: Organization): boolean => {
    return !!organization && !!organization.userIds && organization.id !== snap.organization.id;
  };

  return organizations
    .filter(isNotTheInvitedMember)
    .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
    .map(userId => {
      return prepareNotification({
        message: customMessage(snap),
        userId,
        path,
        organizationId: snap.newStakeholderId,
        docInformations: snap.docInformations
      });
    });
}

/**
 * Temporary function, extract an app from a snap object,
 *
 * TODO: refactor out the SnapObject and fix typing to keep application
 * information down the call stack.
 */
function extractApp(snap: SnapObject): App {
  switch (snap.docInformations.type) {
    case DocType.delivery:
    case DocType.material:
      return App.mediaDelivering;
    case DocType.movie:
      return App.mediaFinanciers;
  }
}

/**
 * Takes a list of Organization and a SnapObject to generate one invitation for each users
 * invited to work on the new document, with custom path and message.
 */
function createInvitation(organizations: Organization[], snap: SnapObject): InvitationStakeholder {
  const app = extractApp(snap);

  if (!snap.count || snap.count <= 1) {
    throw new Error('No invitation needed for document owner.');
  }

  return prepareStakeholderInvitation({
    stakeholderId: snap.newStakeholderId,
    app,
    docId: snap.docInformations.id,
    docType: snap.docInformations.type
  });
}
