import { InvitationDocument, MovieDocument, NotificationDocument, OrganizationDocument, NotificationTypes } from './data/types';
import * as admin from 'firebase-admin';
import { DocumentMeta } from '@blockframes/utils/models-meta';
import { getAppUrl, getDocument, getOrgAppKey, createPublicUserDocument } from './data/internals';
import { NotificationSettingsTemplate, User } from '@blockframes/user/types';
import { sendMailFromTemplate } from './internals/email';
import { emailErrorCodes, EventEmailData, getEventEmailData } from '@blockframes/utils/emails/utils';
import { EventDocument, EventMeta, Screening } from '@blockframes/event/+state/event.firestore';
import {
  reminderEventToUser,
  userJoinedYourOrganization,
  userRequestedToJoinYourOrg,
  requestToAttendEventFromUserAccepted,
  organizationWasAccepted,
  organizationAppAccessChanged,
  requestToAttendEventFromUser,
  invitationToEventFromOrg,
  movieSubmittedEmail,
  movieAcceptedEmail,
  requestToAttendEventFromUserSent,
  userLeftYourOrganization,
  requestToAttendEventFromUserRefused,
  invitationToJoinOrgDeclined,
  requestToJoinOrgDeclined,
  invitationToEventFromOrgUpdated
} from './templates/mail';
import { templateIds } from './templates/ids';
import { canAccessModule, orgName } from '@blockframes/organization/+state/organization.firestore';
import { App, applicationUrl } from '@blockframes/utils/apps';

type Timestamp = admin.firestore.Timestamp;

// @TODO (#2848) forcing to festival since invitations to events are only on this one
const eventAppKey: App = 'festival';

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

  // Theses notifications are never displayed in front since we already have an invitation that will always be displayed
  const notificationsForInvitations: NotificationTypes[] = [
    'requestFromUserToJoinOrgCreate',
    'requestToAttendEventCreated',
    'invitationToAttendScreeningCreated',
    'invitationToAttendMeetingCreated'
  ];

  if (notificationsForInvitations.includes(notification.type)) {
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
      case 'requestFromUserToJoinOrgDeclined':
        await sendRequestToJoinOrgDeclined(recipient, notification)
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message)
        break;
      case 'invitationToJoinOrgDeclined':
        await sendInvitationDeclinedToJoinOrgEmail(recipient, notification)
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message)
        break;
      // Notifications relative to movies
      case 'movieSubmitted':
        await sendMovieSubmittedEmail(recipient, notification)
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'movieAccepted':
        await sendMovieAcceptedEmail(recipient, notification)
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
      case 'requestToAttendEventCreated':
        await sendRequestToAttendEventCreatedEmail(recipient, notification)
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'invitationToAttendMeetingCreated':
      case 'invitationToAttendScreeningCreated':
        await sendInvitationToAttendEventCreatedEmail(recipient, notification)
          .then(_ => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'requestToAttendEventSent':
        await sendRequestToAttendSentEmail(recipient, notification)
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
    // @TODO #4046 Update parameters given to the email function when Vincent updated template
    // Member left/removed from org
    const userRemoved = createPublicUserDocument(notification.user);
    const app = await getOrgAppKey(org);
    const template = userLeftYourOrganization(recipient, userRemoved);
    await sendMailFromTemplate(template, app);
  }

}

/** Send a reminder email 24h or 1h before event starts */
async function sendReminderEmails(recipient: User, notification: NotificationDocument, template: string) {
  const event = await getDocument<EventDocument<Screening>>(`events/${notification.docId}`);
  const org = await getDocument<OrganizationDocument>(`orgs/${event.ownerId}`);
  const eventData = getEventEmailData(event);
  const movie = await getDocument<MovieDocument>(`movies/${event.meta.titleId}`);

  const email = reminderEventToUser(movie.title.international, recipient, orgName(org), eventData, template);
  return await sendMailFromTemplate(email, eventAppKey);
}

/** Send an email when an request to access an event is updated */
async function sendRequestToAttendEventUpdatedEmail(recipient: User, notification: NotificationDocument) {
  const invitation = await getDocument<InvitationDocument>(`invitations/${notification.docId}`);

  if (!!invitation.toOrg) {
    const organizerOrg = await getDocument<OrganizationDocument>(`orgs/${notification.organization.id}`);
    const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
    const eventData = getEventEmailData(event);
    if (notification.invitation.status === 'accepted') {
      const template = requestToAttendEventFromUserAccepted(recipient, orgName(organizerOrg), eventData);
      await sendMailFromTemplate(template, eventAppKey);
    } else {
      const template = requestToAttendEventFromUserRefused(recipient, orgName(organizerOrg), eventData);
      await sendMailFromTemplate(template, eventAppKey);
    }
  } else {
    // @TODO create email when we have toUser
    const organizerUser = await getDocument<OrganizationDocument>(`users/${notification.user.uid}`);
    if (notification.invitation.status === 'accepted') {
      // @TODO #4046 accepted | need text for email
    } else {
      // @TODO #4046 rejected | need text for email
    }
  }

  return;
}

/** Send an email when an invitation to access an event is updated */
async function sendInvitationToAttendEventUpdatedEmail(recipient: User, notification: NotificationDocument) {
  const invitation = await getDocument<InvitationDocument>(`invitations/${notification.docId}`);

  if (!!invitation.fromOrg) {
    const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
    const eventData = getEventEmailData(event);
    const user = await getDocument<User>(`users/${notification.user.uid}`);
    const userOrg = await getDocument<OrganizationDocument>(`orgs/${notification.user.orgId}`);
    const userOrgName = orgName(userOrg);
    if (notification.invitation.status === 'accepted') {
      // @TODO #4046 Update parameters given to the email function when Vincent updated template
      const templateId = templateIds.invitation.attendEvent.accepted;
      const template = invitationToEventFromOrgUpdated(recipient, user, userOrgName, eventData, templateId);
      await sendMailFromTemplate(template, eventAppKey);
    } else {
      // @TODO #4046 Update parameters given to the email function when Vincent updated template
      const templateId = templateIds.invitation.attendEvent.declined;
      const template = invitationToEventFromOrgUpdated(recipient, user, userOrgName, eventData, templateId);
      await sendMailFromTemplate(template, eventAppKey);
    }
  } else {
    // @TODO #4046 create email when we have toUser
    if (notification.invitation.status === 'accepted') {
      // @TODO #4046 accepted | need text for email
    } else {
      // @TODO #4046 rejected | need text for email
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

async function sendRequestToAttendEventCreatedEmail(recipient: User, notification: NotificationDocument) {
  const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
  const org = await getDocument<OrganizationDocument>(`orgs/${notification.user.orgId}`);
  const link = getEventLink(org);
  const urlToUse = applicationUrl[eventAppKey];
  const userName = `${notification.user.firstName} ${notification.user.lastName}`;

  console.log(`Sending request email to attend an event (${notification.docId}) from ${notification.user} to : ${recipient.email}`);
  const templateRequest = requestToAttendEventFromUser(userName!, orgName(org), recipient, event.title, link, urlToUse);
  return sendMailFromTemplate(templateRequest, eventAppKey).catch(e => console.warn(e.message));
}

async function sendInvitationToAttendEventCreatedEmail(recipient: User, notification: NotificationDocument) {
  const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);

  const eventEmailData: EventEmailData = getEventEmailData(event);
  const org = await getDocument<OrganizationDocument>(`orgs/${notification.organization.id}`);
  const urlToUse = applicationUrl[eventAppKey];
  const senderName = orgName(org);
  const link = getEventLink(org);

  console.log(`Sending invitation email for an event (${notification.docId}) from ${senderName} to : ${recipient.email}`);
  const templateInvitation = invitationToEventFromOrg(recipient, senderName, eventEmailData, link, urlToUse);
  return sendMailFromTemplate(templateInvitation, eventAppKey).catch(e => console.warn(e.message));
}

function getEventLink(org: OrganizationDocument) {
  if (canAccessModule('marketplace', org)) {
    return '/c/o/marketplace/invitations';
  } else if (canAccessModule('dashboard', org)) {
    return '/c/o/dashboard/invitations';
  } else {
    return "";
  }
}

/** Send an email to org admin when his/her org is accepted */
async function sendMovieAcceptedEmail(recipient: User, notification: NotificationDocument) {
  // @TODO #4046 Update parameters given to the movieAcceptedEmail function when Vincent updated template
  const movie = await getDocument<MovieDocument>(`movies/${notification.docId}`);
  const movieTitle = movie.title.original ? movie.title.original : movie.title.international;
  const movieUrl = `dashboard/title/${movie.id}`;
  const org = await getDocument<OrganizationDocument>(`orgs/${recipient.orgId}`);

  const app = await getOrgAppKey(org);
  const template = movieAcceptedEmail(recipient, movieTitle, movieUrl);
  await sendMailFromTemplate(template, app);
}

/** Send an email to org admin when his/her org is accepted */
async function sendMovieSubmittedEmail(recipient: User, notification: NotificationDocument) {
  // @TODO #4046 Update parameters given to the email function when Vincent updated template
  const movie = await getDocument<MovieDocument>(`movies/${notification.docId}`);
  const movieTitle = movie.title.original ? movie.title.original : movie.title.international;
  const org = await getDocument<OrganizationDocument>(`orgs/${recipient.orgId}`);

  const app = await getOrgAppKey(org);
  const template = movieSubmittedEmail(recipient, movieTitle);
  await sendMailFromTemplate(template, app);
}

/** Send an email to user when their request to attend an event has been sent */
async function sendRequestToAttendSentEmail(recipient: User, notification: NotificationDocument) {
  // @TODO #4046 Update parameters given to the email function when Vincent updated template
  const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
  const eventEmailData: EventEmailData = getEventEmailData(event);
  const org = await getDocument<OrganizationDocument>(`orgs/${event.ownerId}`);
  const organizerOrgName = orgName(org);

  const app = await getOrgAppKey(org);
  const template = requestToAttendEventFromUserSent(recipient, eventEmailData, organizerOrgName);
  await sendMailFromTemplate(template, app);
}

/** Let admins knows their invitation to an user to join their org has been declined */
async function sendInvitationDeclinedToJoinOrgEmail(recipient: User, notification: NotificationDocument) {
  // @TODO #4046 Update parameters given to the email function when Vincent updated template
  const org = await getDocument<OrganizationDocument>(`orgs/${recipient.orgId}`);
  const user = createPublicUserDocument(notification.user)

  const app = await getOrgAppKey(org);
  const template = invitationToJoinOrgDeclined(recipient, user);
  await sendMailFromTemplate(template, app);
}

/** Let user knows its request to join an org has been declined */
async function sendRequestToJoinOrgDeclined(recipient: User, notification: NotificationDocument) {
  // @TODO #4046 Update parameters given to the email function when Vincent updated template
  const org = await getDocument<OrganizationDocument>(`orgs/${recipient.orgId}`);
  const user = createPublicUserDocument(notification.user);
  const app = await getOrgAppKey(org);
  const template = requestToJoinOrgDeclined(user, orgName(org));
  await sendMailFromTemplate(template, app);
}
