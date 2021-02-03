import { InvitationOrUndefined, InvitationDocument } from "@blockframes/invitation/+state/invitation.firestore";
import { wasCreated, wasAccepted, wasDeclined } from "./utils";
import { NotificationDocument, NotificationType, OrganizationDocument, PublicUser } from "../../data/types";
import { createNotification, triggerNotifications } from "../../notification";
import { getUser } from "../utils";
import { createPublicInvitationDocument, getAdminIds, getDocument } from "../../data/internals";
import { invitationToEventFromOrg, requestToAttendEventFromUser } from '../../templates/mail';
import { sendMailFromTemplate } from '../email';
import { EventDocument, EventMeta } from "@blockframes/event/+state/event.firestore";
import { EmailRecipient, getEventEmailData, EventEmailData } from "@blockframes/utils/emails/utils";
import { App, applicationUrl } from "@blockframes/utils/apps";
import { orgName, canAccessModule } from "@blockframes/organization/+state/organization.firestore";
import * as admin from 'firebase-admin';

function getEventLink(org: OrganizationDocument) {
  if (canAccessModule('marketplace', org)) {
    return '/c/o/marketplace/invitations';
  } else if (canAccessModule('dashboard', org)) {
    return '/c/o/dashboard/invitations';
  } else {
    return "";
  }
}

/**
 * Handles notifications and emails when an invitation to an event is created.
 */
async function onInvitationToAnEventCreate({
  id,
  toUser,
  toOrg,
  fromUser,
  fromOrg,
  mode,
  eventId
}: InvitationDocument) {
  const db = admin.firestore();
  if (!eventId) {
    console.log('eventId is not defined');
    return;
  }

  // Fetch event and verify if it exists
  const event = await getDocument<EventDocument<EventMeta>>(`events/${eventId}`);
  if (!event) {
    throw new Error(`Event ${eventId} doesn't exist !`);
  }

  if (mode === 'request' && event?.privacy === 'public') {
    // This will then trigger "onInvitationToAnEventAccepted" and send in-app notification to 'fromUser'
    return await db.doc(`invitations/${id}`).set({ status: 'accepted' }, { merge: true });
  }

  // Retreive notification recipient
  const recipients: EmailRecipient[] = [];
  if (!!toUser) {
    /**
     * @dev We wants to send this email only if user have an orgId. If not, this means that he already received an
     * email inviting him along with his credentials.
    */
    const user = await getDocument<PublicUser>(`users/${toUser.uid}`);
    if (!user.orgId) {
      console.log('Invitation have already been sent along with user credentials');
      return;
    }
    recipients.push({ email: toUser.email, name: `${toUser.firstName} ${toUser.lastName}` });
  } else if (!!toOrg) {
    const adminIds = await getAdminIds(toOrg.id);
    const admins = await Promise.all(adminIds.map(i => getUser(i)));
    admins.forEach(a => recipients.push({ email: a.email, name: a.firstName }));
  } else {
    throw new Error('Who is this invitation for ?');
  }

  // @TODO (#2848) forcing to festival since invitations to events are only on this one
  const appKey: App = 'festival';

  if (!!fromOrg) {
    /**
     * @dev For now, org can only make invitation to a screeening
     * No need to create a notification because fromOrg and user recipient
     * will already get the invitation displayed on front end.
     */
    const org = await getDocument<OrganizationDocument>(`orgs/${fromOrg.id}`);
    const senderName = orgName(org);
    const link = getEventLink(org);
    const urlToUse = applicationUrl[appKey];
    const eventEmailData: EventEmailData = getEventEmailData(event)

    switch (mode) {
      case 'invitation':
        // @TODO #4046 an organization invites you to a screening OR an User invites you to a meeting
        // Create a new notificationType like invitationToAttendEventCreated | need text for notification
        return Promise.all(recipients.map(recipient => {
          console.log(`Sending invitation email for an event (${eventId}) from ${senderName} to : ${recipient.email}`);
          const templateInvitation = invitationToEventFromOrg(recipient, senderName, eventEmailData, link, urlToUse);
          return sendMailFromTemplate(templateInvitation, appKey).catch(e => console.warn(e.message));
        }))
      case 'request':
      default:
        throw new Error('Org can not create requests for events, reserved to users only');
    }
  } else if (!!fromUser) {

    const senderEmail = fromUser.email;
    const org = await getDocument<OrganizationDocument>(`orgs/${fromUser.orgId}`);
    const link = getEventLink(org);
    const urlToUse = applicationUrl[appKey];

    switch (mode) {
      case 'invitation':
        throw new Error('User can not create invitations for events, reserved to orgs only.');
      case 'request':
      default:

        // Notification to request sender, letting him know that his request have been sent
        const notification = createNotification({
          toUserId: fromUser.uid,
          user: fromUser,
          docId: eventId,
          type: 'requestToAttendEventSent'
        });

        await triggerNotifications([notification]);

        // @TODO #4046 an user requests access to event your organize
        // Create a new notificationType like requestToAttendEventCreated | need text for notification
        return Promise.all(recipients.map(recipient => {
          const userName = `${fromUser.firstName} ${fromUser.lastName}`
          console.log(`Sending request email to attend an event (${eventId}) from ${senderEmail} to : ${recipient.email}`);
          const templateRequest = requestToAttendEventFromUser(userName!, orgName(org), recipient, event.title, link, urlToUse);
          return sendMailFromTemplate(templateRequest, appKey).catch(e => console.warn(e.message));
        }))
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
