import { InvitationOrUndefined, InvitationDocument } from "@blockframes/invitation/+state/invitation.firestore";
import { wasCreated, wasAccepted, wasDeclined } from "./utils";
import { NotificationDocument, OrganizationDocument } from "../../data/types";
import { createNotification, triggerNotifications } from "../../notification";
import { db, getUser } from "../firebase";
import { getAdminIds, getDocument, getFromEmail, getAppUrl, getOrgAppSlug } from "../../data/internals";
import { invitationToEventFromOrg, requestToAttendEventFromUser } from '../../templates/mail';
import { sendMailFromTemplate } from '../email';
import { EventDocument, EventMeta } from "@blockframes/event/+state/event.firestore";
import { EmailRecipient } from "@blockframes/utils/emails";
import { getAppName } from "@blockframes/utils/apps";


function getEventLink(org: OrganizationDocument) {
  if (org.appAccess?.catalog.marketplace || org.appAccess?.festival.marketplace) {
    return '/c/o/marketplace/invitations';
  } else if (org.appAccess?.catalog.dashboard || org.appAccess?.festival.dashboard) {
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
  const recipients: EmailRecipient[] = [];
  if (!!toUser) {
    recipients.push({ email: toUser.email, name: toUser.firstName });
  } else if (!!toOrg) {
    const adminIds = await getAdminIds(toOrg.id);
    const admins = await Promise.all(adminIds.map(i => getUser(i)));
    admins.forEach(a => recipients.push({ email: a.email, name: a.firstName }));
  } else {
    throw new Error('Who is this invitation for ?');
  }

  if (!!fromOrg) {
    /**
     * @dev For now, org can only make invitation to a screeening
     * No need to create a notification because fromOrg and user recipient
     * will already get the invitation displayed on front end.
     */
    const senderEmail = fromOrg.denomination.public;
    const org = await getDocument<OrganizationDocument>(`orgs/${fromOrg.id}`);
    const link = getEventLink(org);
    const urlToUse = await getAppUrl(org);
    const appSlug = await getOrgAppSlug(org);
    const appName = getAppName(appSlug)
    const from = await getFromEmail(org);

    switch (mode) {
      case 'invitation':
        return Promise.all(recipients.map(recipient => {
          console.log(`Sending invitation email for an event (${docId}) from ${senderEmail} to : ${recipient.email}`);
          const templateInvitation = invitationToEventFromOrg(recipient, fromOrg.denomination.full, appName.label, event.title, link, urlToUse);
          return sendMailFromTemplate(templateInvitation, from);
        }))
      case 'request':
      default:
        throw new Error('Org can not create requests for events, reserved to users only');
    }
  } else if (!!fromUser) {
    /**
     * @dev No need to create a notification because fromOrg and user recipient
     * will already get the invitation displayed on front end.
     */
    const senderEmail = fromUser.email;
    const org = await getDocument<OrganizationDocument>(`orgs/${fromUser.orgId}`);
    const link = getEventLink(org);
    const urlToUse = await getAppUrl(org);
    const appSlug = await getOrgAppSlug(org);
    const appName = getAppName(appSlug)
    const from = await getFromEmail(org);

    switch (mode) {
      case 'invitation':
        throw new Error('User can not create invitations for events, reserved to orgs only.');
      case 'request':
      default:
        return Promise.all(recipients.map(recipient => {
          console.log(`Sending request email to attend an event (${docId}) from ${senderEmail} to : ${recipient.email}`);
          const templateRequest = requestToAttendEventFromUser(fromUser.firstName!, org.denomination.full,appName.label, recipient, event.title, link, urlToUse);
          return sendMailFromTemplate(templateRequest, from);
        }))
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
