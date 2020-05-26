import { InvitationOrUndefined, InvitationDocument } from "@blockframes/invitation/+state/invitation.firestore";
import { wasCreated, wasAccepted, wasDeclined } from "./utils";
import { NotificationDocument, OrganizationDocument } from "../../data/types";
import { createNotification, triggerNotifications } from "../../notification";
import { db } from "../firebase";
import { getAdminIds, getDocument, getFromEmail, getAppUrl } from "../../data/internals";
import { invitationToMeetingFromUser, invitationToScreeningFromOrg, requestToAttendEventFromUser } from '../../templates/mail';
import { sendMailFromTemplate } from '../email';
import { EventDocument, EventMeta } from "@blockframes/event/+state/event.firestore";

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
  docId
}: InvitationDocument) {
  if (!docId) {
    console.log('docId is not defined');
    return;
  }

  // Fetch event and verify if it exists
  const event = await getDocument<EventDocument<EventMeta>>(`events/${docId}`);
  if (!event) {
    throw new Error(`Event ${docId} doesn't exist !`);
  }

  if (mode === 'request' && event?.isPrivate === false) {
    // This will then trigger "onInvitationToAnEventAccepted" and send in-app notification to 'fromUser'
    return await db.doc(`invitations/${id}`).set({ status: 'accepted' }, { merge: true });
  }

  // Retreive notification recipient
  let recipient: string;
  let link: string;
  if (!!toUser) {
    recipient = toUser.email;
  } else if (!!toOrg) {
    /** Attendee is only an user or an email for now */
    throw new Error('Cannot invite an org to an event for now. Not implemented.');
  } else {
    throw new Error('Who is this invitation for ?');
  }

  if (!!fromOrg) {
    /**
     * @dev For now, org can only make invitation to a screeening
     * No need to create a notification because fromOrg and user recipient
     * will already get the invitation displayed on front end.
     */
    const senderName = fromOrg.denomination.public ? fromOrg.denomination.public : fromOrg.denomination.full;
    const org = await getDocument<OrganizationDocument>(`orgs/${toUser.orgId}`);
    if (org.appAccess?.catalog.marketplace || org.appAccess?.festival.marketplace) {
      link = '/c/o/marketplace/invitations';
    } else if (org.appAccess?.catalog.dashboard || org.appAccess?.festival.dashboard) {
      link = '/c/o/dashboard/invitations';
    } else {
      link = "";
    }
    console.log(`Sending invitation email for an event (${docId}) from ${senderName} to : ${recipient}`);
    const urlToUse = await getAppUrl(org);
    const from = await getFromEmail(org);
    return await sendMailFromTemplate(invitationToScreeningFromOrg(toUser, fromOrg.denomination.full, event.title, link, urlToUse), from);

  } else if (!!fromUser) {
    /**
     * @dev No need to create a notification because fromOrg and user recipient
     * will already get the invitation displayed on front end.
     */
    const senderEmail = fromUser.email;
    const org = await getDocument<OrganizationDocument>(`orgs/${fromUser.orgId}`);
    if (org.appAccess?.catalog.marketplace || org.appAccess?.festival.marketplace) {
      link = '/c/o/marketplace/invitations';
    } else if (org.appAccess?.catalog.dashboard || org.appAccess?.festival.dashboard) {
      link = '/c/o/dashboard/invitations';
    } else {
      link = "";
    }
    const urlToUse = await getAppUrl(org);
    const from = await getFromEmail(org);
    switch (mode) {
      case 'invitation':
        console.log(`Sending invitation email for an event (${docId}) from ${senderEmail} to : ${recipient}`);
        const templateInvitation = invitationToMeetingFromUser(toUser.firstName!, fromUser, org.denomination.full, event.title, link, urlToUse);
        return sendMailFromTemplate(templateInvitation, from);
      case 'request':
      default:
        console.log(`Sending request email to attend an event (${docId}) from ${senderEmail} to : ${recipient}`);
        const templateRequest = requestToAttendEventFromUser(fromUser.firstName!, org.denomination.full, toUser, event.title, link, urlToUse);
        return sendMailFromTemplate(templateRequest, from);
    }
  } else {
    throw new Error('Did not found invitation sender');
  }
}

/**
 * Handles notifications and emails when an invitation to an event is accepted.
 */
async function onInvitationToAnEventAccepted({
  fromUser,
  fromOrg,
  toUser,
  toOrg,
  docId,
}: InvitationDocument) {

  const notifications: NotificationDocument[] = [];

  if (!!fromUser) {
    const notification = createNotification({
      toUserId: fromUser.uid,
      docId,
      type: 'invitationToAttendEventAccepted'
    });

    if (!!toUser) {
      notification.user = toUser; // The subject that have accepted the invitation
    } else if (!!toOrg) {
      notification.organization = toOrg; // The subject that have accepted the invitation
    } else {
      throw new Error('Did not found invitation recipient.');
    }
    notifications.push(notification);
  } else if (!!fromOrg) {
    const org = await getDocument<OrganizationDocument>(`orgs/${fromOrg.id}`);
    const adminIds = await getAdminIds(org.id);
    adminIds.forEach(toUserId => {
      const notification = createNotification({
        toUserId,
        docId,
        type: 'invitationToAttendEventAccepted'
      });

      if (!!toUser) {
        notification.user = toUser; // The subject that have accepted the invitation
      } else if (!!toOrg) {
        notification.organization = toOrg; // The subject that have accepted the invitation
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
 * Handles notifications and emails when an invitation to an event is rejected.
 */
async function onInvitationToAnEventRejected({
  fromUser,
  fromOrg,
  toUser,
  toOrg,
  docId,
}: InvitationDocument) {

  const notifications: NotificationDocument[] = [];

  if (!!fromUser) {
    const notification = createNotification({
      toUserId: fromUser.uid,
      docId,
      type: 'invitationToAttendEventDeclined'
    });

    if (!!toUser) {
      notification.user = toUser; // The subject that have declined the invitation
    } else if (!!toOrg) {
      notification.organization = toOrg; // The subject that have declined the invitation
    } else {
      throw new Error('Did not found invitation recipient.');
    }
    notifications.push(notification);
  } else if (!!fromOrg) {
    const org = await getDocument<OrganizationDocument>(`orgs/${fromOrg.id}`);
    const adminIds = await getAdminIds(org.id);
    adminIds.forEach(toUserId => {
      const notification = createNotification({
        toUserId,
        docId,
        type: 'invitationToAttendEventDeclined'
      });

      if (!!toUser) {
        notification.user = toUser; // The subject that have declined the invitation
      } else if (!!toOrg) {
        notification.organization = toOrg; // The subject that have declined the invitation
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
  } else if (wasAccepted(before!, after)) {
    return onInvitationToAnEventAccepted(invitation);
  } else if (wasDeclined(before!, after)) {
    return onInvitationToAnEventRejected(invitation);
  }
}

export async function createNotificationsForEventsToStart() {
  // @TODO (#2555)

  // 1 Fetch events that are about to start
  // 2 Fetch attendees (invitations accepted)
  // 3 Create notifications

  /*const notification = createNotification({
    toUserId: toUser.uid,
    docId,
    type: 'eventIsAboutToStart''
  });*/

  /*if (!!fromUser) {
    notification.user = fromUser;
  } else if (!!fromOrg) {
    notification.organization = fromOrg;
  } else {
    throw new Error('Did not found invitation sender');
  }*/

  //return triggerNotifications([notification])
}

export async function isUserInvitedToScreening(userId: string, movieId: string) {

  const acceptedInvitations = db.collection('invitations')
    .where('type', '==', 'attendEvent')
    .where('docId', '==', movieId)
    .where('toUser.uid', '==', userId)
    .where('status', '==', 'accepted')
    .where('mode', '==', 'invitation');

  const acceptedRequests = db.collection('invitations')
    .where('type', '==', 'attendEvent')
    .where('docId', '==', movieId)
    .where('fromUser.uid', '==', userId)
    .where('status', '==', 'accepted')
    .where('mode', '==', 'request');

  const [invitations, requests] = await Promise.all([
    acceptedInvitations.get(),
    acceptedRequests.get()
  ]);

  if (invitations.size === 0 && requests.size === 0) return false;

  return true;
}
