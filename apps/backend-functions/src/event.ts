import { db } from './internals/firebase';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { triggerNotifications } from './notification';
import { getDocument, BlockframesSnapshot } from '@blockframes/firebase-utils';
import { eventCreatedAdminEmail } from './templates/mail';
import { getMailSender } from '@blockframes/utils/apps';
import { sendMail } from './internals/email';
import { groupIds } from '@blockframes/utils/emails/ids';
import { airtable } from './internals/airtable';
import { tables } from '@env';
import {
  Movie,
  Organization,
  PublicUser,
  EventMeta,
  Event,
  createInternalDocumentMeta,
  createPublicUser,
  createNotification,
  Invitation,
  eventsToCrmEvents,
  crmEventsToExport,
} from '@blockframes/model';

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
  const emailData = eventCreatedAdminEmail('festival', event);
  return sendMail(emailData, from, groupIds.noUnsubscribeLink);
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

export async function updateAirtableEvents({
  events,
  orgs,
  invites,
}: {
  events: Event[];
  orgs: Organization[];
  invites: Invitation[];
}) {
  console.log('===== Updating events =====');

  const crmEvents = eventsToCrmEvents(events, orgs, invites);

  const rows = crmEventsToExport(crmEvents);

  const synchronization = await airtable.synchronize(tables.events, rows, 'event id');
  console.log(synchronization);
}
