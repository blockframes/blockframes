import { db } from './internals/firebase';
import { EventDocument, EventMeta } from '@blockframes/event/+state/event.firestore';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { createDocumentMeta, createPublicUserDocument, getDocument } from './data/internals';
import { createNotification, triggerNotifications } from './notification';
import { PublicUser } from './data/types';
import { Movie, Organization } from '@blockframes/model';

/**
 * Removes invitations and notifications related to an event when event is deleted
 * @param snap
 */
export async function onEventDelete(snap: FirebaseFirestore.DocumentSnapshot) {
  const event = snap.data() as EventDocument<EventMeta>;
  const batch = db.batch();

  const invitsCollectionRef = await db
    .collection('invitations')
    .where('eventId', '==', event.id)
    .get();
  for (const doc of invitsCollectionRef.docs) {
    batch.delete(doc.ref);
  }

  const notifsCollectionRef = await db
    .collection('notifications')
    .where('docId', '==', event.id)
    .get();
  for (const doc of notifsCollectionRef.docs) {
    batch.delete(doc.ref);
  }
  return batch.commit();
}

export async function createScreeningRequest(
  data: { uid: string; movieId: string },
  context: CallableContext
) {
  const { uid, movieId } = data;

  if (!context?.auth) {
    throw new Error('Permission denied: missing auth context.');
  }
  if (!uid) {
    throw new Error('User id is mandatory for screening requested');
  }
  if (!movieId) {
    throw new Error('Movie id is mandatory for screening requested');
  }

  const [user, movie] = await Promise.all([
    getDocument<PublicUser>(`users/${uid}`),
    getDocument<Movie>(`movies/${movieId}`),
  ]);

  const getNotifications = (org: Organization) =>
    org.userIds.map((userId) =>
      createNotification({
        toUserId: userId,
        type: 'screeningRequested',
        docId: movieId,
        user: createPublicUserDocument(user),
        _meta: createDocumentMeta({ createdFrom: 'festival' }),
      })
    );

  for (const orgId of movie.orgIds) {
    getDocument<Organization>(`orgs/${orgId}`).then(getNotifications).then(triggerNotifications);
  }

  // notification to user who requested the screening
  const notification = createNotification({
    toUserId: uid,
    type: 'screeningRequestSent',
    docId: movieId,
    user: createPublicUserDocument(user),
    _meta: createDocumentMeta({ createdFrom: 'festival' }),
  });
  triggerNotifications([notification]);
}
