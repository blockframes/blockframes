import { db } from './internals/firebase';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { triggerNotifications } from './notification';
import { Movie, Organization, PublicUser, EventMeta, Event, createInternalDocumentMeta, createPublicUser, createNotification } from '@blockframes/model';
import { getDocument, BlockframesSnapshot } from '@blockframes/firebase-utils';
import { sendEventCreatedEmail } from './templates/mail';
import { getMailSender } from '@blockframes/utils/apps';
import { sendMail } from './internals/email';

/**
 * Removes invitations and notifications related to an event when event is deleted
 * @param snap
 */
export async function onEventDelete(snap: BlockframesSnapshot<Event<EventMeta>>) {
  const event = snap.data();
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

export async function onEventCreate(snap: BlockframesSnapshot<Event<EventMeta>>) {
  const event = snap.data();
  const from = getMailSender('festival');
  
  await sendMail(sendEventCreatedEmail('festival', event), from);
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
        user: createPublicUser(user),
        _meta: createInternalDocumentMeta({ createdFrom: 'festival' }),
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
    user: createPublicUser(user),
    _meta: createInternalDocumentMeta({ createdFrom: 'festival' }),
  });
  triggerNotifications([notification]);
}
