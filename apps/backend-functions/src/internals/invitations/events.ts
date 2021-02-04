import { InvitationOrUndefined, InvitationDocument } from "@blockframes/invitation/+state/invitation.firestore";
import { wasCreated, wasAccepted, wasDeclined } from "./utils";
import { NotificationDocument, NotificationType, OrganizationDocument, PublicUser } from "../../data/types";
import { createNotification, triggerNotifications } from "../../notification";
import { getUser } from "../utils";
import { createPublicInvitationDocument, getAdminIds, getDocument } from "../../data/internals";
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

  if (invitation.mode === 'request' && event?.privacy === 'public') {
    // This will then trigger "onInvitationToAnEventAccepted" and send in-app notification to 'fromUser'
    return await db.doc(`invitations/${invitation.id}`).set({ status: 'accepted' }, { merge: true });
  }

  // Retreive notification recipient
  const recipients: string[] = [];
  if (!!invitation.toUser) {
    /**
     * @dev We wants to send this email only if user have an orgId. If not, this means that he already received an
     * email inviting him along with his credentials.
    */
    const user = await getDocument<PublicUser>(`users/${invitation.toUser.uid}`);
    if (!user.orgId) {
      console.log('Invitation have already been sent along with user credentials');
      return;
    }
    recipients.push(invitation.toUser.uid);
  } else if (!!invitation.toOrg) {
    const adminIds = await getAdminIds(invitation.toOrg.id);
    const admins = await Promise.all(adminIds.map(i => getUser(i)));
    admins.forEach(a => recipients.push(a.uid));
  } else {
    throw new Error('Who is this invitation for ?');
  }

  const notifications = [];

  if (!!invitation.fromOrg) {
    /**
     * @dev For now, org can only make invitation to a screeening
     */

    switch (invitation.mode) {
      case 'invitation':

        // Notification to request recipients
        recipients.map(recipient => {
          notifications.push(createNotification({
            toUserId: recipient,
            organization: invitation.fromOrg,
            docId: invitation.eventId,
            invitation: createPublicInvitationDocument(invitation),
            type: event.type == 'meeting' ? 'invitationToAttendMeetingCreated' : 'invitationToAttendScreeningCreated'
          }));
        });

        return triggerNotifications(notifications);
      case 'request':
      default:
        throw new Error('Org can not create requests for events, reserved to users only');
    }
  } else if (!!invitation.fromUser) {

    switch (invitation.mode) {
      case 'invitation':
        throw new Error('User can not create invitations for events, reserved to orgs only.');
      case 'request':
      default:

        // Notification to request sender, letting him know that his request have been sent
        notifications.push(createNotification({
          toUserId: invitation.fromUser.uid,
          user: invitation.fromUser,
          docId: invitation.eventId,
          invitation: createPublicInvitationDocument(invitation),
          type: 'requestToAttendEventSent'
        }));

        // Notification to request recipients
        recipients.map(recipient => {
          notifications.push(createNotification({
            toUserId: recipient,
            user: invitation.fromUser,
            docId: invitation.eventId,
            invitation: createPublicInvitationDocument(invitation),
            type: 'requestToAttendEventCreated'
          }));
        });

        return triggerNotifications(notifications);
    }
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
      type: 'requestToAttendEventUpdated'
    });

    if (!!invitation.toUser) {
      notification.user = invitation.toUser; // The subject that have accepted or rejected the request
    } else if (!!invitation.toOrg) {
      notification.organization = invitation.toOrg; // The subject that have accepted or rejected the request
    } else {
      throw new Error('Did not found invitation recipient.');
    }
    notifications.push(notification);
  } else if (!!invitation.fromOrg && invitation.mode === 'invitation') {
    const org = await getDocument<OrganizationDocument>(`orgs/${invitation.fromOrg.id}`);
    const adminIds = await getAdminIds(org.id);
    adminIds.forEach(toUserId => {
      const notification = createNotification({
        toUserId,
        docId: invitation.eventId,
        invitation: createPublicInvitationDocument(invitation),
        type: 'invitationToAttendEventUpdated'
      });

      if (!!invitation.toUser) {
        notification.user = invitation.toUser; // The subject that have accepted or rejected the invitation
      } else if (!!invitation.toOrg) {
        notification.organization = invitation.toOrg; // The subject that have accepted or rejected the invitation
      } else {
        throw new Error('Did not found invitation recipient.');
      }
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
): Promise<any> {
  if (wasCreated(before, after)) {
    return onInvitationToAnEventCreate(invitation);
  } else if (wasAccepted(before!, after) || wasDeclined(before!, after)) {
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
  const eventsHourCollection = await fetchEventStartingIn(oneHour, (oneHour + halfHour));

  // 2 Fetch attendees (invitations accepted)
  const invitationsDay = await fetchAttendeesToEvent(eventsDayCollection.docs);
  const invitationsHour = await fetchAttendeesToEvent(eventsHourCollection.docs);

  // 3 Create notifications if not already exists
  const notificationsDays = await createNotificationIfNotExists(invitationsDay, 'oneDayReminder');
  const notificationsHours = await createNotificationIfNotExists(invitationsHour, 'eventIsAboutToStart')
  const notifications = notificationsDays.concat(notificationsHours);

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

/** Fetch accepted invitations to an event */
async function fetchAttendeesToEvent(collectionDocs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]) {
  const db = admin.firestore();
  const invitations: InvitationDocument[] = [];

  const docsIds: string[] = collectionDocs.map(doc => doc.data().id);
  const promises = docsIds.map(id => db.collection('invitations').where('eventId', '==', id).where('status', '==', 'accepted').get());
  const invitationsSnaps = await Promise.all(promises);
  invitationsSnaps.forEach(snap => snap.docs.forEach(doc => invitations.push(doc.data() as InvitationDocument)));

  return invitations;
}

/**
 * Look after notification already existing for one user and one event
 * Return an array of new notifications to create
 */
async function createNotificationIfNotExists(invitations: InvitationDocument[], notificationType: NotificationType) {
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
        type: notificationType
      }));
    }
  }

  return notifications;
}

/**
 * Check if a given user has accepted an invitation to an event.
 * @param userId
 * @param eventId
 */
export async function isUserInvitedToEvent(userId: string, eventId: string) {
  const db = admin.firestore();
  const acceptedInvitations = db.collection('invitations')
    .where('type', '==', 'attendEvent')
    .where('eventId', '==', eventId)
    .where('toUser.uid', '==', userId)
    .where('status', '==', 'accepted')
    .where('mode', '==', 'invitation');

  const acceptedRequests = db.collection('invitations')
    .where('type', '==', 'attendEvent')
    .where('eventId', '==', eventId)
    .where('fromUser.uid', '==', userId)
    .where('status', '==', 'accepted')
    .where('mode', '==', 'request');

  const [invitations, requests] = await Promise.all([
    acceptedInvitations.get(),
    acceptedRequests.get()
  ]);

  return !(invitations.size === 0 && requests.size === 0);
}
