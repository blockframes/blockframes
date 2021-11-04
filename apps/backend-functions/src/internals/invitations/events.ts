import { InvitationOrUndefined, InvitationDocument } from "@blockframes/invitation/+state/invitation.firestore";
import { wasCreated, wasAccepted, wasDeclined, hasUserAnOrgOrIsAlreadyInvited } from "./utils";
import { NotificationDocument, NotificationTypes, OrganizationDocument } from "../../data/types";
import { createNotification, triggerNotifications } from "../../notification";
import { getUser } from "../utils";
import { createDocumentMeta, createPublicInvitationDocument, getAdminIds, getDocument } from "../../data/internals";
import { EventDocument, EventMeta } from "@blockframes/event/+state/event.firestore";
import * as admin from 'firebase-admin';

/**
 * Handles notifications and emails when an invitation to an event is created.
 */
async function onInvitationToAnEventCreate(invitation: InvitationDocument) {
  const db = admin.firestore();
  if (!invitation.eventId) {
    console.log('eventId is not defined');
    return;
  }

  // Fetch event and verify if it exists
  const event = await getDocument<EventDocument<EventMeta>>(`events/${invitation.eventId}`);
  if (!event) {
    throw new Error(`Event ${invitation.eventId} doesn't exist !`);
  }

  if (invitation.mode === 'request' && event?.accessibility === 'public') {
    // This will then trigger "onInvitationToAnEventAccepted" and send in-app notification to 'fromUser'
    return await db.doc(`invitations/${invitation.id}`).set({ status: 'accepted' }, { merge: true });
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
    const adminIds = await getAdminIds(invitation.toOrg.id);
    const admins = await Promise.all(adminIds.map(i => getUser(i)));
    admins.forEach(a => recipients.push(a.uid));
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
        invitation: createPublicInvitationDocument(invitation),
        type: event.type === 'meeting' ? 'invitationToAttendMeetingCreated' : 'invitationToAttendScreeningCreated',
        _meta: createDocumentMeta({ createdFrom: 'festival' }) // Events are only on festival
      }));
    });

    return triggerNotifications(notifications);

  } else if (!!invitation.fromUser && invitation.mode === 'request') {

    // Notification to request sender, letting him know that his request have been sent
    notifications.push(createNotification({
      toUserId: invitation.fromUser.uid,
      user: invitation.fromUser,
      docId: invitation.eventId,
      invitation: createPublicInvitationDocument(invitation),
      type: 'requestToAttendEventSent',
      _meta: createDocumentMeta({ createdFrom: 'festival' }) // Events are only on festival
    }));

    // Notification to request recipients
    recipients.map(recipient => {
      notifications.push(createNotification({
        toUserId: recipient,
        user: invitation.fromUser,
        docId: invitation.eventId,
        invitation: createPublicInvitationDocument(invitation),
        type: 'requestToAttendEventCreated',
        _meta: createDocumentMeta({ createdFrom: 'festival' }) // Events are only on festival
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
async function onInvitationToAnEventAcceptedOrRejected(invitation: InvitationDocument) {

  const notifications: NotificationDocument[] = [];

  if (!!invitation.fromUser && invitation.mode === 'request') {
    const notification = createNotification({
      toUserId: invitation.fromUser.uid,
      docId: invitation.eventId,
      invitation: createPublicInvitationDocument(invitation),
      type: 'requestToAttendEventUpdated',
      organization: invitation.toOrg, // The subject that have accepted or rejected the request
      _meta: createDocumentMeta({ createdFrom: 'festival' }) // Events are only on festival
    });
    notifications.push(notification);
  } else if (!!invitation.fromOrg && invitation.mode === 'invitation') {
    const org = await getDocument<OrganizationDocument>(`orgs/${invitation.fromOrg.id}`);
    const adminIds = await getAdminIds(org.id);
    adminIds.forEach(toUserId => {
      const notification = createNotification({
        toUserId,
        docId: invitation.eventId,
        invitation: createPublicInvitationDocument(invitation),
        type: 'invitationToAttendEventUpdated',
        user: invitation.toUser, // The subject that have accepted or rejected the invitation
        _meta: createDocumentMeta({ createdFrom: 'festival' }) // Events are only on festival
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
  before: InvitationOrUndefined,
  after: InvitationDocument,
  invitation: InvitationDocument
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
  const invitationsDay = await fetchAttendeesToEvent(eventsDayCollection.docs);
  const invitationsDayPending = await fetchAttendeesToEvent(eventsDayCollection.docs, true);
  const invitationsHour = await fetchAttendeesToEvent(eventsHourCollection.docs);

  // 3 Create notifications if not already exists
  const notificationsDays = await createNotificationIfNotExists(invitationsDay, 'oneDayReminder');
  const notificationsDaysPending = await createNotificationIfNotExists(invitationsDayPending, 'oneDayReminder');
  const notificationsHours = await createNotificationIfNotExists(invitationsHour, 'eventIsAboutToStart');
  const notifications = notificationsDays.concat(notificationsHours).concat(notificationsDaysPending);

  return notifications.length ? triggerNotifications(notifications) : undefined;
}

/** Fetch event collection with a start and an end range search */
async function fetchEventStartingIn(from: number, to: number) {
  const db = admin.firestore();
  return await db.collection('events')
    .where('start', '>=', new Date(Date.now() + from))
    .where('start', '<', new Date(Date.now() + to))
    .get();
}

/**
 * Fetch accepted or pending invitations to an event
 * @param collectionDocs Event docs
 * @param pendingInvites Set true for invitations that are pending invites (not requests)
 */
async function fetchAttendeesToEvent(collectionDocs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[], pendingInvites = false) {
  const db = admin.firestore();
  const invitations: InvitationDocument[] = [];

  const docsIds: string[] = collectionDocs.map(doc => doc.data().id);
  const promises = pendingInvites
    ? docsIds.map(id => db.collection('invitations').where('eventId', '==', id).where('mode', '==', 'invitation').where('status', '==', 'pending').get())
    : docsIds.map(id => db.collection('invitations').where('eventId', '==', id).where('status', '==', 'accepted').get())
  const invitationsSnaps = await Promise.all(promises);
  invitationsSnaps.forEach(snap => snap.docs.forEach(doc => invitations.push(doc.data() as InvitationDocument)));

  return invitations;
}

/**
 * Look after notification already existing for one user and one event
 * Return an array of new notifications to create
 */
async function createNotificationIfNotExists(invitations: InvitationDocument[], notificationType: NotificationTypes) {
  const notifications = [];
  const db = admin.firestore();

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
        _meta: createDocumentMeta({ createdFrom: 'festival' }) // Events are only on festival
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
export async function isUserInvitedToEvent(userId: string, event: EventDocument<EventMeta>, email?: string) {
  const db = admin.firestore();

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

  if (email && event.accessibility === 'invitation-only') {
    const emailInvitations = await accepted.where('toUser.email', '==', email).where('mode', '==', 'invitation').get();
    return emailInvitations.size > 0;
  }

  return false;
}
