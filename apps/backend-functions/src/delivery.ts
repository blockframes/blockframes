import { db, functions } from './internals/firebase';
import { triggerNotifications } from './notification';
import { getCollection, getCount, getDocument, getOrganizationsOfDocument } from './data/internals';
import {
  Movie,
  OrganizationDocument,
  SnapObject,
  DeliveryDocument,
  MaterialDocument,
  StakeholderDocument
} from './data/types';
import { copyMaterialsToMovie } from './material';
import { createNotification, NotificationType } from '@blockframes/notification/types';

export async function onDeliveryUpdate(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
) {
  if (!change.after || !change.before) {
    throw new Error(`Parameter 'change' not found`);
  }

  const deliveryDoc = change.after.data();
  const deliveryDocBefore = change.before.data();

  if (!deliveryDoc || !deliveryDocBefore) {
    throw new Error(`No changes detected on this document`);
  }

  /**
   * Note: Google Cloud Function enforces "at least once" delivery for events.
   * This means that an event may processed twice by this function, with the same Before and After data.
   * We store the Google Cloud Funtion's event ID in the delivery, retrieve it and verify that its different
   * betweeen two runs to enforce "only once delivery".
   */
  const delivery = await getDocument<DeliveryDocument>(`deliveries/${deliveryDoc.id}`);
  const processedId = delivery.processedId;

  const [organizations, movie, stakeholderCount] = await Promise.all([
    getOrganizationsOfDocument(delivery.id, 'deliveries'),
    getDocument<Movie>(`movies/${delivery.movieId}`),
    getCount(`deliveries/${delivery.id}/stakeholders`)
  ]);

  const isNewSignature = deliveryDoc.validated.length === deliveryDocBefore.validated.length + 1;
  const isFullSignatures = deliveryDoc.validated.length === stakeholderCount;
  const isBeforeStateClean = deliveryDocBefore.validated.length === stakeholderCount - 1;

  if (isNewSignature && !isFullSignatures) {
    await notifyOnNewSignee(delivery, organizations, movie);
  }

  if (!isBeforeStateClean || !isFullSignatures) {
    throw new Error(`There is no new signature on this document`);
  }

  if (processedId === context.eventId) {
    throw new Error(`Document already processed with this context`);
  }

  // When validated.length reaches stakeholderCount.length
  try {
    await db.doc(`deliveries/${delivery.id}`).update({ processedId: context.eventId });
    const [materialsMovie, materialsDelivery] = await Promise.all([
      getCollection<MaterialDocument>(`movies/${delivery.movieId}/materials`),
      getCollection<MaterialDocument>(`deliveries/${delivery.id}/materials`)
    ]);

    const promises = [copyMaterialsToMovie(materialsDelivery, materialsMovie, delivery)];

    const snapObject: SnapObject = {
      organization: undefined,
      movie: { id: movie.id, title: movie.main.title },
      docId: delivery.id,
      type: NotificationType.finalSignature
    };

    // When delivery is signed, we create notifications for each stakeholder
    if (delivery.mustBeSigned) {
      const notifications = createSignatureNotifications(organizations, snapObject);
      promises.push(triggerNotifications(notifications));
    }

    await db.doc(`deliveries/${delivery.id}`).update({ isSigned: true });
    await Promise.all(promises);
  } catch (e) {
    await db.doc(`deliveries/${delivery.id}`).update({ processedId: null });
    throw e;
  }
  return true;
}

/**
 * Notifications are triggered when a new id is pushed into delivery.validated, which is considered as a signature
 * Note: It doesn't trigger if this is the last signature, as another notification will be sent to notify
 * that all stakeholders approved the delivery.
 */
async function notifyOnNewSignee(
  delivery: any,
  organizationDocuments: OrganizationDocument[],
  movie: Movie
): Promise<void> {
  const newStakeholderId = delivery.validated[delivery.validated.length - 1];
  const newStakeholder = await getDocument<StakeholderDocument>(
    `deliveries/${delivery.id}/stakeholders/${newStakeholderId}`
  );

  if (!newStakeholder) {
    throw new Error("This stakeholder doesn't exist !");
  }

  const newStakeholderOrg = await getDocument<OrganizationDocument>(`orgs/${newStakeholder!.id}`);

  if (!newStakeholderOrg) {
    throw new Error("This organization doesn't exist !");
  }

  const snapObject: SnapObject = {
    organization: { id: newStakeholderOrg.id, name: newStakeholderOrg.name },
    movie: { id: movie.id, title: movie.main.title },
    docId: delivery.id,
    type: NotificationType.newSignature
  };

  const notifications = createSignatureNotifications(organizationDocuments, snapObject);

  await triggerNotifications(notifications);
}

/**  Create custom notifications for deliveries signatures. */
function createSignatureNotifications(
  organizationDocuments: OrganizationDocument[],
  snapObject: SnapObject
) {
  return organizationDocuments
    .filter(organizationDocument => !!organizationDocument && !!organizationDocument.userIds)
    .reduce((ids: string[], { userIds }) => [...ids, ...userIds], [])
    .map(userId => {
      return createNotification({
        userId,
        organization: snapObject.organization,
        type: snapObject.type,
        docId: snapObject.docId,
        movie: snapObject.movie
      });
    });
}
