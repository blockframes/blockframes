import { InvitationDocument, MovieDocument, NotificationDocument, OrganizationDocument } from './data/types';
import * as admin from 'firebase-admin';
import { DocumentMeta } from '@blockframes/utils/models-meta';
import { NotificationType } from '@blockframes/notification/types';
import { getAppUrl, getDocument, getOrgAppKey } from './data/internals';
import { NotificationSettingsTemplate, User } from '@blockframes/user/types';
import { sendMail /* @TODO #4046 remove import */, sendMailFromTemplate } from './internals/email';
import { emailErrorCodes, getEventEmailData } from '@blockframes/utils/emails/utils';
import { EventDocument, EventMeta, Screening } from '@blockframes/event/+state/event.firestore';
import {
  reminderEventToUser,
  userJoinedYourOrganization,
  userRequestedToJoinYourOrg,
  requestToAttendEventFromUserAccepted,
  organizationWasAccepted,
  organizationAppAccessChanged
} from './templates/mail';
import { templateIds } from './templates/ids';
import { orgName } from '@blockframes/organization/+state/organization.firestore';
import { App } from '@blockframes/utils/apps';

type Timestamp = admin.firestore.Timestamp;

/** Takes one or more notifications and add them on the notifications collection */
export async function triggerNotifications(notifications: NotificationDocument[]): Promise<any> {
  const db = admin.firestore();
  const batch = db.batch();

  for (const n of notifications) {
    const notification = await appendNotificationSettings(n);

    const notificationRef = db.collection('notifications').doc(notification.id);
    batch.set(notificationRef, notification);
  }

  return batch.commit();
}

async function appendNotificationSettings(notification: NotificationDocument) {
  // get user notification settings
  const user = await getDocument<User>(`users/${notification.toUserId}`);

  const updateNotif = ({ email, app }: NotificationSettingsTemplate) => {
    if (email) notification.email = { isSent: false };
    if (app) notification.app = { isRead: false };
  }

  if (!!user.settings?.notifications && notification.type in user.settings.notifications) {
    updateNotif(user.settings.notifications[notification.type]);
  } else {
    updateNotif({ app: true, email: true });
  }

  if (notification.type === 'requestFromUserToJoinOrgCreate') {
    // This is notification is never displayed in front since we already have an invitation that will always be displayed
    delete notification.app;
  }

  return notification;
}

function createDocumentMeta(meta: Partial<DocumentMeta<Timestamp>> = {}): DocumentMeta<Timestamp> {
  return {
    createdBy: 'internal',
    createdAt: admin.firestore.Timestamp.now(),
    ...meta
  }
}

/** Create a Notification with required and generic information. */
export function createNotification(notification: Partial<NotificationDocument> = {}): NotificationDocument {
  const db = admin.firestore();
  return {
    _meta: createDocumentMeta(),
    type: 'movieAccepted', // We need a default value for backend-function strict mode
    toUserId: '',
    id: db.collection('notifications').doc().id,
    ...notification
  };
}

export async function onNotificationCreate(snap: FirebaseFirestore.DocumentSnapshot): Promise<any> {
  const notification = snap.data() as NotificationDocument;

  if (notification.email?.isSent === false) {
    // Update notification state

    const recipient = await getDocument<User>(`users/${notification.toUserId}`);

    switch (notification.type) {

      // Notification related to organization
      case 'organizationAcceptedByArchipelContent':
        await sendMailToOrgAcceptedAdmin(recipient, notification)
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'orgAppAccessChanged':
        await sendOrgAppAccessChangedEmail(recipient, notification)
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message)
        break;
      case 'invitationFromUserToJoinOrgDecline':
        // @TODO #4046 create mail
        break;

      // Notifications relative to movies
      case 'movieSubmitted':
        //! There is no email template for now
        //TODO 4046 Add new template from Sendgrid
        await sendMail({ to: recipient.email, subject: notification.type, text: 'Your movie has been submitted.' })
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'movieAccepted':
        //! There is no email template for now
        //TODO 4046 Add new template from Sendgrid
        await sendMail({ to: recipient.email, subject: notification.type, text: 'Your movie has been accepted by the Archipel team.' })
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;

      // Notifications relative to invitations
      case 'orgMemberUpdated':
        await sendOrgMemberUpdatedEmail(recipient, notification)
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'requestFromUserToJoinOrgCreate':
        await sendUserRequestedToJoinYourOrgEmail(recipient, notification)
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;

      // Events related notifications
      case 'requestToAttendEventSent':
        //! There is no email template for now
        //TODO 4046 Add new template from Sendgrid
        await sendMail({ to: recipient.email, subject: notification.type, text: 'Your request has been sent.' })
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'eventIsAboutToStart':
        await sendReminderEmails(recipient, notification, templateIds.eventReminder.oneHour)
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message)
        break;
      case 'oneDayReminder':
        await sendReminderEmails(recipient, notification, templateIds.eventReminder.oneDay)
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message)
        break;
      case 'requestToAttendEventUpdated':
        await sendRequestToAttendEventUpdatedEmail(recipient, notification)
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'invitationToAttendEventUpdated':
        await sendInvitationToAttendEventUpdatedEmail(recipient, notification)
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      default:
        notification.email.error = emailErrorCodes.noTemplate.code;
        break;
    }

    const db = admin.firestore();
    await db.collection('notifications').doc(notification.id).set({ email: notification.email }, { merge: true });
  }
}

async function sendUserRequestedToJoinYourOrgEmail(recipient: User, notification: NotificationDocument) {
  const org = await getDocument<OrganizationDocument>(`orgs/${notification.organization.id}`);
  const urlToUse = await getAppUrl(org);

  const template = userRequestedToJoinYourOrg({
    adminEmail: recipient.email,
    adminName: recipient.firstName!,
    organizationName: orgName(org),
    organizationId: notification.organization.id,
    userFirstname: notification.user!.firstName,
    userLastname: notification.user!.lastName
  }, urlToUse);

  const appKey = await getOrgAppKey(org);
  return sendMailFromTemplate(template, appKey);
}

async function sendOrgMemberUpdatedEmail(recipient: User, notification: NotificationDocument) {
  const org = await getDocument<OrganizationDocument>(`orgs/${notification.organization.id}`);

  if (org.userIds.includes(notification.user.uid)) {
    const template = userJoinedYourOrganization(
      recipient.email,
      recipient.firstName!,
      orgName(org),
      notification.user!.firstName,
      notification.user!.lastName,
      notification.user!.email
    );

    const appKey = await getOrgAppKey(org);
    return sendMailFromTemplate(template, appKey);
  } else {
    // @TODO #4046 member removed from org email
  }

}

/** Send a reminder email 24h or 1h before event starts */
async function sendReminderEmails(recipient: User, notification: NotificationDocument, template: string) {
  const event = await getDocument<EventDocument<Screening>>(`events/${notification.docId}`);
  const org = await getDocument<OrganizationDocument>(`orgs/${event.ownerId}`);
  const eventData = getEventEmailData(event);
  const movie = await getDocument<MovieDocument>(`movies/${event.meta.titleId}`);
  const app = await getOrgAppKey(org);

  const email = reminderEventToUser(movie.title.international, recipient, orgName(org), eventData, template);
  return await sendMailFromTemplate(email, app);
}

/** Send an email when an request to access an event is updated */
async function sendRequestToAttendEventUpdatedEmail(recipient: User, notification: NotificationDocument) {
  const invitation = await getDocument<InvitationDocument>(`invitations/${notification.docId}`);

  if (!!invitation.toOrg) {
    // Forcing to festival since invitations to events are only on this one
    const app: App = 'festival';
    const organizerOrg = await getDocument<OrganizationDocument>(`orgs/${notification.organization.id}`);
    const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
    const eventData = getEventEmailData(event);
    if (notification.invitation.status === 'accepted') {
      const template = requestToAttendEventFromUserAccepted(recipient, orgName(organizerOrg), eventData);
      await sendMailFromTemplate(template, app);
    } else {
      // @TODO rejected
    }
  } else {
    // @TODO create email when we have toUser 
    const organizerUser = await getDocument<OrganizationDocument>(`users/${notification.user.uid}`);
    if (notification.invitation.status === 'accepted') {
      // @TODO accepted
    } else {
      // @TODO rejected
    }
  }

  return;
}

/** Send an email when an invitation to access an event is updated */
async function sendInvitationToAttendEventUpdatedEmail(recipient: User, notification: NotificationDocument) {
  const invitation = await getDocument<InvitationDocument>(`invitations/${notification.docId}`);

  if (!!invitation.toOrg) {
    if (notification.invitation.status === 'accepted') {
      // @TODO accepted
    } else {
      // @TODO rejected
    }
  } else {
    // @TODO create email when we have toUser
    if (notification.invitation.status === 'accepted') {
      // @TODO accepted
    } else {
      // @TODO rejected
    }
  }

  return;
}

/** Send an email to org admin when his/her org is accepted */
async function sendMailToOrgAcceptedAdmin(recipient: User, notification: NotificationDocument) {
  const app = await getOrgAppKey(notification.organization.id);
  const template = organizationWasAccepted(recipient.email, recipient.firstName);
  await sendMailFromTemplate(template, app);
}

/** Send email to organization's admins when org appAccess has changed */
async function sendOrgAppAccessChangedEmail(recipient: User, notification: NotificationDocument) {
  const org = await getDocument<OrganizationDocument>(`orgs/${notification.organization.id}`);
  const app = await getOrgAppKey(org);
  const url = await getAppUrl(org);
  const template = organizationAppAccessChanged(recipient, url);
  await sendMailFromTemplate(template, app);
}
