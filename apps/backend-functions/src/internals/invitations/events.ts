import { InvitationToAnEvent, InvitationOrUndefined, InvitationDocument } from "@blockframes/invitation/types";
import { wasCreated, wasAccepted, wasDeclined } from "./utils";
import { NotificationDocument, OrganizationDocument } from "../../data/types";
import { createNotification, triggerNotifications } from "../../notification";
import { db } from "../firebase";
import { getAdminIds } from "../../data/internals";

/**
 * Handles notifications and emails when an invitation to an event is created.
 */
export async function onInvitationToAnEventCreate({
  toUser,
  toOrg,
  fromUser,
  fromOrg,
  mode,
  docId
}: InvitationToAnEvent) {
  const eventId = docId;

  let recipient: string;
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
    const senderEmail = fromOrg.denomination.public;
    console.log(`Sending invitation email for a screening event (${eventId}) from ${senderEmail} to : ${recipient}`);
    // @TODO (#2461) send invitation email for a screening event

  } else if (!!fromUser) {
    /**
     * @dev No need to create a notification because fromOrg and user recipient
     * will already get the invitation displayed on front end.
     */
    const senderEmail = fromUser.email;
    switch (mode) {
      case 'invitation':
        console.log(`Sending invitation email for a meeeting event (${eventId}) from ${senderEmail} to : ${recipient}`);
        // @TODO (#2461) send invitation to a meeting email template
        break;
      case 'request':
        console.log(`Sending request email to attend an event (${eventId}) from ${senderEmail} to : ${recipient}`);
        // @TODO (#2461) send (invitation or screening) request email template
        break;
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
}: InvitationToAnEvent) {

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
    const orgSnapshot = await db.doc(`orgs/${fromOrg.id}`).get();
    const org = orgSnapshot.data() as OrganizationDocument;
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
}: InvitationToAnEvent) {

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
    const orgSnapshot = await db.doc(`orgs/${fromOrg.id}`).get();
    const org = orgSnapshot.data() as OrganizationDocument;
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
  invitation: InvitationToAnEvent
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
