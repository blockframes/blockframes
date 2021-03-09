import { InvitationDocument, MovieDocument, NotificationDocument, OrganizationDocument, NotificationTypes } from './data/types';
import * as admin from 'firebase-admin';
import { getAppUrl, getDocument, getOrgAppKey, createPublicUserDocument, createDocumentMeta } from './data/internals';
import { NotificationSettingsTemplate, User } from '@blockframes/user/types';
import { sendMailFromTemplate, sendMail } from './internals/email';
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
  movieAcceptedEmail,
  requestToAttendEventFromUserSent,
  userLeftYourOrganization,
  requestToAttendEventFromUserRefused,
  invitationToJoinOrgDeclined,
  requestToJoinOrgDeclined,
  invitationToEventFromOrgUpdated,
  userJoinOrgPendingRequest
} from './templates/mail';
import { templateIds, unsubscribeGroupIds } from './templates/ids';
import { canAccessModule, orgName } from '@blockframes/organization/+state/organization.firestore';
import { App, applicationUrl } from '@blockframes/utils/apps';

// @TODO (#2848) forcing to festival since invitations to events are only on this one
const eventAppKey: App = 'festival';
// This is for letting user unsubscribe from every email except the critical ones as reset password.
const unsubscribeId = unsubscribeGroupIds.allExceptCriticals;

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

  // Send an email to org's admin to let them know they have a request to join their org
  const template = userRequestedToJoinYourOrg({
    adminEmail: recipient.email,
    adminName: recipient.firstName!,
    organizationName: orgName(org),
    organizationId: notification.organization.id,
    userFirstname: notification.user!.firstName,
    userLastname: notification.user!.lastName
  }, urlToUse);

  const appKey = await getOrgAppKey(org);

  // Send an email to the user who did the request to let him know its request has been sent
  const templateRequest = userJoinOrgPendingRequest(
    notification.user.email,
    notification.organization.denomination.full,
    notification.user.firstName!
  );

  const promises: Promise<any>[] = [];
  promises.push(sendMailFromTemplate(template, appKey, unsubscribeId));
  promises.push(sendMailFromTemplate(templateRequest, appKey, unsubscribeId))
  return Promise.all(promises);
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
    return sendMailFromTemplate(template, appKey, unsubscribeId);
  } else {
    // Member left/removed from org
    const userRemoved = createPublicUserDocument(notification.user);
    const app = await getOrgAppKey(org);
    const template = userLeftYourOrganization(recipient, userRemoved);
    await sendMailFromTemplate(template, app, unsubscribeId);
  }

}

/** Send a reminder email 24h or 1h before event starts */
async function sendReminderEmails(recipient: User, notification: NotificationDocument, template: string) {
  const event = await getDocument<EventDocument<Screening>>(`events/${notification.docId}`);
  const org = await getDocument<OrganizationDocument>(`orgs/${event.ownerOrgId}`);
  const eventData = getEventEmailData(event);
  const movie = await getDocument<MovieDocument>(`movies/${event.meta.titleId}`);

  const email = reminderEventToUser(movie.title.international, recipient, orgName(org), eventData, template);
  return await sendMailFromTemplate(email, eventAppKey, unsubscribeId);
}

/** Send an email when an request to access an event is updated */
async function sendRequestToAttendEventUpdatedEmail(recipient: User, notification: NotificationDocument) {
  const invitation = await getDocument<InvitationDocument>(`invitations/${notification.invitation.id}`);

  if (!!invitation.toOrg) {
    const organizerOrg = await getDocument<OrganizationDocument>(`orgs/${notification.organization.id}`);
    const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
    const eventData = getEventEmailData(event);
    if (notification.invitation.status === 'accepted') {
      const template = requestToAttendEventFromUserAccepted(recipient, orgName(organizerOrg), eventData);
      await sendMailFromTemplate(template, eventAppKey, unsubscribeId);
    } else {
      const template = requestToAttendEventFromUserRefused(recipient, orgName(organizerOrg), eventData);
      await sendMailFromTemplate(template, eventAppKey, unsubscribeId);
    }
  } else {
    throw new Error('Invitation with mode === "request" can only have "toOrg" attribute');
  }

  return;
}

/** Send an email when an invitation to access an event is updated */
async function sendInvitationToAttendEventUpdatedEmail(recipient: User, notification: NotificationDocument) {
  const invitation = await getDocument<InvitationDocument>(`invitations/${notification.invitation.id}`);
  if (!!invitation.fromOrg) {
    const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
    const eventData = getEventEmailData(event);
    const user = await getDocument<User>(`users/${notification.user.uid}`);
    const userOrg = await getDocument<OrganizationDocument>(`orgs/${user.orgId}`);
    const userOrgName = orgName(userOrg);
    if (notification.invitation.status === 'accepted') {
      const templateId = templateIds.invitation.attendEvent.accepted;
      const template = invitationToEventFromOrgUpdated(recipient, user, userOrgName, eventData, templateId);
      return sendMailFromTemplate(template, eventAppKey, unsubscribeId);
    } else {
      const templateId = templateIds.invitation.attendEvent.declined;
      const template = invitationToEventFromOrgUpdated(recipient, user, userOrgName, eventData, templateId);
      return sendMailFromTemplate(template, eventAppKey, unsubscribeId);
    }
  } else {
    throw new Error('Invitation with mode === "invitation" can only have "fromOrg" attribute');
  }

  return;
}

/** Send an email to org admin when his/her org is accepted */
async function sendMailToOrgAcceptedAdmin(recipient: User, notification: NotificationDocument) {
  const app = await getOrgAppKey(notification.organization.id);
  const template = organizationWasAccepted(recipient.email, recipient.firstName);
  await sendMailFromTemplate(template, app, unsubscribeId);
}

/** Send email to organization's admins when org appAccess has changed */
async function sendOrgAppAccessChangedEmail(recipient: User, notification: NotificationDocument) {
  const org = await getDocument<OrganizationDocument>(`orgs/${notification.organization.id}`);
  const app = await getOrgAppKey(org);
  const url = await getAppUrl(org);
  // @#4046 Change text to something more generic than `Your organization has now access to Archipel Market.` wich can be wrong
  const template = organizationAppAccessChanged(recipient, url);
  await sendMailFromTemplate(template, app, unsubscribeId);
}

async function sendRequestToAttendEventCreatedEmail(recipient: User, notification: NotificationDocument) {
  const eventDoc = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
  const eventData: EventEmailData = getEventEmailData(eventDoc);
  const org = await getDocument<OrganizationDocument>(`orgs/${notification.user.orgId}`);
  const link = getEventLink(org);
  const urlToUse = applicationUrl[eventAppKey];
  const userName = `${notification.user.firstName} ${notification.user.lastName}`;

  console.log(`Sending request email to attend an event (${notification.docId}) from ${notification.user} to : ${recipient.email}`);
  const templateRequest = requestToAttendEventFromUser(userName!, orgName(org), recipient, eventData, link, urlToUse);
  return sendMailFromTemplate(templateRequest, eventAppKey, unsubscribeId).catch(e => console.warn(e.message));
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
  return sendMailFromTemplate(templateInvitation, eventAppKey, unsubscribeId).catch(e => console.warn(e.message));
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
  const movie = await getDocument<MovieDocument>(`movies/${notification.docId}`);
  const movieUrl = `c/o/dashboard/title/${movie.id}`;
  const org = await getDocument<OrganizationDocument>(`orgs/${recipient.orgId}`);

  const app = await getOrgAppKey(org);
  const template = movieAcceptedEmail(recipient, movie.title.international, movieUrl);
  await sendMailFromTemplate(template, app, unsubscribeId);
}

/** Send an email to C8 members when a movie is submitted */
async function sendMovieSubmittedEmail(recipient: User, notification: NotificationDocument) {
  const movie = await getDocument<MovieDocument>(`movies/${notification.docId}`);
  return sendMail({
    to: recipient.email,
    subject: 'A movie has been submitted.',
    text: `The new movie ${movie.title.international} has been submitted, please check it on CRM.`
  });
}

/** Send an email to user when their request to attend an event has been sent */
async function sendRequestToAttendSentEmail(recipient: User, notification: NotificationDocument) {
  const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
  const eventEmailData: EventEmailData = getEventEmailData(event);
  const org = await getDocument<OrganizationDocument>(`orgs/${event.ownerOrgId}`);
  const organizerOrgName = orgName(org);

  const app = await getOrgAppKey(org);
  const template = requestToAttendEventFromUserSent(recipient, eventEmailData, organizerOrgName);
  await sendMailFromTemplate(template, app, unsubscribeId);
}

/** Let admins knows their invitation to an user to join their org has been declined */
async function sendInvitationDeclinedToJoinOrgEmail(recipient: User, notification: NotificationDocument) {
  const org = await getDocument<OrganizationDocument>(`orgs/${recipient.orgId}`);
  const user = createPublicUserDocument(notification.user)

  const app = await getOrgAppKey(org);
  const template = invitationToJoinOrgDeclined(recipient, user);
  await sendMailFromTemplate(template, app, unsubscribeId);
}

/** Let user knows its request to join an org has been declined */
async function sendRequestToJoinOrgDeclined(recipient: User, notification: NotificationDocument) {
  const org = await getDocument<OrganizationDocument>(`orgs/${recipient.orgId}`);
  const user = createPublicUserDocument(notification.user);
  const app = await getOrgAppKey(org);
  const template = requestToJoinOrgDeclined(user, orgName(org));
  await sendMailFromTemplate(template, app, unsubscribeId);
}
