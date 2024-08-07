import { wasCreated, wasAccepted, wasDeclined, hasUserAnOrgOrIsAlreadyInvited } from './utils';
import { triggerNotifications } from '../../notification';
import { getAdminIds } from '../../data/internals';
import {
  Event,
  EventMeta,
  Meeting,
  Screening,
  Notification,
  NotificationTypes,
  Invitation,
  createPublicInvitation,
  createInternalDocumentMeta,
  Organization,
  createNotification,
  getGuest,
} from '@blockframes/model';
import { getDb, getDocument, queryDocuments } from '@blockframes/firebase-utils';

/**
 * Handles notifications and emails when an invitation to an event is created.
 */
async function onInvitationToAnEventCreate(invitation: Invitation) {
  const db = getDb();
  if (!invitation.eventId) {
    console.log('eventId is not defined');
    return;
  }

  // Fetch event and verify if it exists
  const event = await getDocument<Event<Meeting | Screening>>(`events/${invitation.eventId}`);
  if (!event) {
    throw new Error(`Event ${invitation.eventId} doesn't exist !`);
  }

  if (invitation.mode === 'request' && event?.accessibility === 'public') {
    // This will then trigger "onInvitationToAnEventAccepted" and send in-app notification to 'fromUser'
    return db.doc(`invitations/${invitation.id}`).set({ status: 'accepted' }, { merge: true });
  }

  // Retreive notification recipient
  const recipients: string[] = [];
  if (invitation.toUser) {
    /**
     * @dev We wants to send this email only if user have an orgId and a validated account. If not, this means that he already received an
     * email inviting him along with his credentials.
    */
    const hasOrgOrOrgInvitation = await hasUserAnOrgOrIsAlreadyInvited([invitation.toUser.email]);
    if (!hasOrgOrOrgInvitation) {
      console.log('Invitation have already been sent along with user credentials');
      return;
    }

    recipients.push(invitation.toUser.uid);
  } else if (invitation.toOrg) {
    const ids = await getAdminIds(invitation.toOrg.id);
    if (event.meta?.organizerUid) {
      ids.push(event.meta?.organizerUid);
    }
    Array.from(new Set(ids)).forEach(uid => recipients.push(uid));

  } else {
    throw new Error('Who is this invitation for ?');
  }

  const notifications = [];

  if (!!invitation.fromOrg && invitation.mode === 'invitation') {

    // Notification to request recipients
    recipients.map(recipient => {
      notifications.push(createNotification({
        toUserId: recipient,
        organization: invitation.fromOrg,
        docId: invitation.eventId,
        invitation: createPublicInvitation(invitation),
        type: event.type === 'meeting' ? 'invitationToAttendMeetingCreated' : event.type === 'screening' ? 'invitationToAttendScreeningCreated' : 'invitationToAttendSlateCreated',
        _meta: createInternalDocumentMeta({ createdFrom: 'festival' }) // Events are only on festival
      }));
    });

    return triggerNotifications(notifications);

  } else if (!!invitation.fromUser && invitation.mode === 'request') {

    // Notification to request sender, letting him know that his request have been sent
    notifications.push(createNotification({
      toUserId: invitation.fromUser.uid,
      user: invitation.fromUser,
      docId: invitation.eventId,
      invitation: createPublicInvitation(invitation),
      type: 'requestToAttendEventSent',
      _meta: createInternalDocumentMeta({ createdFrom: 'festival' }) // Events are only on festival
    }));

    // Notification to request recipients
    recipients.map(recipient => {
      notifications.push(createNotification({
        toUserId: recipient,
        user: invitation.fromUser,
        docId: invitation.eventId,
        invitation: createPublicInvitation(invitation),
        type: 'requestToAttendEventCreated',
        _meta: createInternalDocumentMeta({ createdFrom: 'festival' }) // Events are only on festival
      }));
    });

    return triggerNotifications(notifications);

  } else {
    throw new Error('Did not found invitation sender');
  }
}

/**
 * Handles notifications when an invitation to an event is updated (accepted or rejected).
 */
async function onInvitationToAnEventAcceptedOrRejected(invitation: Invitation) {

  const notifications: Notification[] = [];

  if (!!invitation.fromUser && invitation.mode === 'request') {
    const notification = createNotification({
      toUserId: invitation.fromUser.uid,
      docId: invitation.eventId,
      invitation: createPublicInvitation(invitation),
      type: 'requestToAttendEventUpdated',
      organization: invitation.toOrg, // The subject that have accepted or rejected the request
      _meta: createInternalDocumentMeta({ createdFrom: 'festival' }) // Events are only on festival
    });
    notifications.push(notification);
  } else if (!!invitation.fromOrg && invitation.mode === 'invitation') {
    const org = await getDocument<Organization>(`orgs/${invitation.fromOrg.id}`);
    const ids = await getAdminIds(org.id);

    const event = await getDocument<Event<Meeting | Screening>>(`events/${invitation.eventId}`);
    if (event.meta?.organizerUid) {
      ids.push(event.meta?.organizerUid);
    }
    Array.from(new Set(ids)).forEach(toUserId => {
      const notification = createNotification({
        toUserId,
        docId: invitation.eventId,
        invitation: createPublicInvitation(invitation),
        type: 'invitationToAttendEventUpdated',
        user: invitation.toUser, // The subject that have accepted or rejected the invitation
        _meta: createInternalDocumentMeta({ createdFrom: 'festival' }) // Events are only on festival
      });

      notifications.push(notification);
    });
  } else {
    throw new Error('Did not found invitation sender.');
  }

  return triggerNotifications(notifications);
}

/**
 * Dispatch the invitation update call depending on whether the invitation
 * was 'created', 'accepted' or 'rejected'.
 */
export async function onInvitationToAnEventUpdate(
  before: Invitation,
  after: Invitation,
  invitation: Invitation
) {
  if (wasCreated(before, after)) {
    return onInvitationToAnEventCreate(invitation);
  } else if (wasAccepted(before, after) || wasDeclined(before, after)) {
    return onInvitationToAnEventAcceptedOrRejected(invitation);
  }
}

/**
 * Notify users with accepted invitation to events that are starting in 1 day
 * Send also a reminder email
 */
export async function createNotificationsForEventsToStart() {
  const oneHour = 3600 * 1000;
  const oneDay = 24 * oneHour;
  const halfHour = 1800 * 1000;

  // 1 Fetch events that are about to start
  const eventsDayCollection = await fetchEventStartingIn(oneDay, (oneDay + oneHour));
  const eventsHourCollection = await fetchEventStartingIn(halfHour, oneHour);

  // 2 Fetch attendees (invitations accepted)
  const invitationsDay = await fetchAttendeesToEvent(eventsDayCollection);
  const invitationsDayPending = await fetchAttendeesToEvent(eventsDayCollection, true);
  const invitationsHour = await fetchAttendeesToEvent(eventsHourCollection);

  // 3 Create notifications if not already exists
  const notificationsDays = await createNotificationIfNotExists(invitationsDay, 'oneDayReminder');
  const notificationsDaysPending = await createNotificationIfNotExists(invitationsDayPending, 'oneDayReminder');
  const notificationsHours = await createNotificationIfNotExists(invitationsHour, 'eventIsAboutToStart');
  const notifications = notificationsDays.concat(notificationsHours).concat(notificationsDaysPending);

  return notifications.length ? triggerNotifications(notifications) : undefined;
}

export async function createNotificationsForFinishedScreenings() {
  const halfAnHour = 1800 * 1000;
  const screenings = await fetchFinishedScreenings(halfAnHour);
  const notifications: Notification[] = [];

  for (const screening of screenings) {
    const attendees = Object.values(screening.meta.attendees);

    const regularAttendees = attendees.filter(attendee => !attendee.isAnonymous);
    const anonymousAttendees = attendees.filter(attendee => attendee.isAnonymous);

    const regularAttendeesEmail = regularAttendees.map(attendee => attendee.email);
    const anonymousAttendeesEmail = anonymousAttendees.map(attendee => attendee.email).filter(e => !!e);

    const invitations = await fetchEventInvitations(screening.id);

    for (const invitation of invitations) {
      const userEmail = getGuest(invitation, 'user').email;

      // We only focus on regular attendees for public events because we cannot match invitation.email and connected user.email
      const attendeesEmail = screening.accessibility !== 'public' ? regularAttendeesEmail.concat(anonymousAttendeesEmail) : regularAttendeesEmail;

      const notificationType = attendeesEmail.includes(userEmail) ? 'userAttendedScreening' : 'userMissedScreening';
      const [notification] = await createNotificationIfNotExists([invitation], notificationType);
      notifications.push(notification);
    }
  }
  return notifications.length ? triggerNotifications(notifications) : undefined;
}

/** Fetch event collection with a start and an end range search */
function fetchEventStartingIn(from: number, to: number) {
  const db = getDb();
  const query = db.collection('events')
    .where('start', '>=', new Date(Date.now() + from))
    .where('start', '<', new Date(Date.now() + to));

  return queryDocuments<Event>(query);
}

/** Fetch screenings finished since a specific time */
function fetchFinishedScreenings(since: number) {
  const db = getDb();
  const query = db.collection('events')
    .where('type', '==', 'screening')
    .where('end', '>=', new Date(Date.now() - since))
    .where('end', '<', new Date());

  return queryDocuments<Event<Screening>>(query);
}

/** Fetch invitations related to an event */
function fetchEventInvitations(eventId: string) {
  const db = getDb();
  return queryDocuments<Invitation>(db.collection('invitations').where('eventId', '==', eventId));
}

/**
 * Fetch accepted or pending invitations to an event
 * @param collectionDocs Event docs
 * @param pendingInvites Set true for invitations that are pending invites (not requests)
 */
async function fetchAttendeesToEvent(events: Event[], pendingInvites = false) {
  const db = getDb();

  const docsIds: string[] = events.map(event => event.id);
  const queries = pendingInvites
    ? docsIds.map(id => db.collection('invitations').where('eventId', '==', id).where('mode', '==', 'invitation').where('status', '==', 'pending'))
    : docsIds.map(id => db.collection('invitations').where('eventId', '==', id).where('status', '==', 'accepted'));

  const invitations = await Promise.all(queries.map(q => queryDocuments<Invitation>(q)));
  return invitations.flat();
}

/**
 * Look after notification already existing for one user and one event
 * Return an array of new notifications to create
 */
async function createNotificationIfNotExists(invitations: Invitation[], notificationType: NotificationTypes) {
  const notifications = [];
  const db = getDb();

  for (const invitation of invitations) {
    const toUserId = invitation.mode === 'request' ? invitation.fromUser.uid : invitation.toUser.uid;
    const existingNotifications = await db.collection('notifications')
      .where('docId', '==', invitation.eventId)
      .where('toUserId', '==', toUserId)
      .where('type', '==', notificationType)
      .get();

    // There is no existing notification for this user
    if (existingNotifications.empty) {
      notifications.push(createNotification({
        toUserId,
        docId: invitation.eventId,
        type: notificationType,
        _meta: createInternalDocumentMeta({ createdFrom: 'festival' }) // Events are only on festival
      }));
    }
  }

  return notifications;
}

/**
 * Check if a given user has accepted an invitation to an event.
 * @param userId
 * @param event
 * @param email
 */
export async function isUserInvitedToEvent(userId: string, event: Event<EventMeta>, email?: string) {
  const db = getDb();

  if (event.accessibility === 'public') return true;

  const accepted = db.collection('invitations')
    .where('type', '==', 'attendEvent')
    .where('eventId', '==', event.id)
    .where('status', '==', 'accepted');

  const acceptedInvitations = accepted.where('toUser.uid', '==', userId).where('mode', '==', 'invitation');
  const acceptedRequests = accepted.where('fromUser.uid', '==', userId).where('mode', '==', 'request');

  const [invitations, requests] = await Promise.all([
    acceptedInvitations.get(),
    acceptedRequests.get()
  ]);

  if (invitations.size || requests.size) return true;

  if (email && event.accessibility === 'protected') {
    const emailInvitations = await accepted.where('toUser.email', '==', email).where('mode', '==', 'invitation').get();
    return emailInvitations.size > 0;
  }

  return false;
}
