import { InvitationDocument, MovieDocument, NotificationDocument, OrganizationDocument, NotificationTypes } from './data/types';
import { getDocument, getOrgAppKey, createDocumentMeta } from './data/internals';
import { NotificationSettingsTemplate, User } from '@blockframes/user/types';
import { sendMailFromTemplate } from './internals/email';
import { emailErrorCodes, EventEmailData, getEventEmailData, getOrgEmailData, getUserEmailData } from '@blockframes/utils/emails/utils';
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
  userJoinOrgPendingRequest,
  offerCreatedConfirmationEmail,
  appAccessEmail,
  contractCreatedEmail,
  counterOfferRecipientEmail,
  negotiationEmail,
  offerAcceptedOrDeclined,
  buyerOfferCreatedConfirmationEmail,
  counterOfferCreatorEmail
} from './templates/mail';
import { templateIds, groupIds } from '@blockframes/utils/emails/ids';
import { canAccessModule } from '@blockframes/organization/+state/organization.firestore';
import { App, applicationUrl } from '@blockframes/utils/apps';
import * as admin from 'firebase-admin';
import { Movie } from '@blockframes/movie/+state';
import { PublicInvitation } from '@blockframes/invitation/+state/invitation.firestore';
import { logger } from 'firebase-functions';
import { NegotiationDocument } from '@blockframes/contract/negotiation/+state/negotiation.firestore';
import { Offer } from '@blockframes/contract/offer/+state';
import { ContractDocument } from '@blockframes/contract/contract/+state';
import { format } from 'date-fns';
import { movieCurrencies } from '@blockframes/utils/static-model';
import { centralOrgId } from './environments/environment';


// @TODO (#2848) forcing to festival since invitations to events are only on this one
const eventAppKey: App = 'festival';

/** Takes one or more notifications and add them on the notifications collection */
export async function triggerNotifications(notifications: NotificationDocument[]) {
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

  // Theses notifications are never displayed in front
  const notificationsForInvitations: NotificationTypes[] = [
    // we already have an invitation that will always be displayed instead
    'requestFromUserToJoinOrgCreate',
    'requestToAttendEventCreated',
    'invitationToAttendScreeningCreated',
    'invitationToAttendMeetingCreated',

    // user does not have access to app yet, notification only used to send email
    'requestFromUserToJoinOrgPending'
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

export async function onNotificationCreate(snap: FirebaseFirestore.DocumentSnapshot) {
  const notification = snap.data() as NotificationDocument;

  if (notification.email?.isSent === false) {
    // Update notification state

    const recipient = await getDocument<User>(`users/${notification.toUserId}`);

    switch (notification.type) {

      // Notification related to organization
      case 'organizationAcceptedByArchipelContent':
        await sendMailToOrgAcceptedAdmin(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'orgAppAccessChanged':
        await sendOrgAppAccessChangedEmail(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message)
        break;
      case 'requestFromUserToJoinOrgDeclined':
        await sendRequestToJoinOrgDeclined(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message)
        break;
      case 'invitationToJoinOrgDeclined':
        await sendInvitationDeclinedToJoinOrgEmail(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message)
        break;
      // Notifications relative to movies
      case 'movieSubmitted':
        // No email is sent to user(s)'s org that submitted the movie, only a notification
        // But an email is sent to supportEmails.[app] (catalog & MF only)
        break;
      case 'movieAccepted':
        await sendMovieAcceptedEmail(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;

      // Notifications relative to invitations
      case 'orgMemberUpdated':
        await sendOrgMemberUpdatedEmail(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'requestFromUserToJoinOrgCreate':
        await sendUserRequestedToJoinYourOrgEmail(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'requestFromUserToJoinOrgPending':
        await sendPendingRequestToJoinOrgEmail(notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;

      // Events related notifications
      case 'requestToAttendEventCreated':
        await sendRequestToAttendEventCreatedEmail(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'invitationToAttendMeetingCreated':
      case 'invitationToAttendScreeningCreated':
        await sendInvitationToAttendEventCreatedEmail(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'requestToAttendEventSent':
        await sendRequestToAttendSentEmail(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'eventIsAboutToStart':
        await sendReminderEmails(recipient, notification, templateIds.eventReminder.oneHour)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message)
        break;
      case 'oneDayReminder':
        await sendReminderEmails(recipient, notification, templateIds.eventReminder.oneDay)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message)
        break;
      case 'requestToAttendEventUpdated':
        await sendRequestToAttendEventUpdatedEmail(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'invitationToAttendEventUpdated':
        await sendInvitationToAttendEventUpdatedEmail(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'contractCreated':
        await sendContractCreated(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'offerCreatedConfirmation':
        await sendOfferCreatedConfirmation(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'negotiationCreated':
        await sendNegotiationCreatedConfirmation(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'myOrgAcceptedAContract':
        await sendAcceptedContractConfirmation(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'myContractWasAccepted':
        await sendContractAcceptedConfirmation(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'myOrgDeclinedAContract':
        await sendDeclinedContractConfirmation(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'myContractWasDeclined':
        await sendContractDeclinedConfirmation(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'offerAccepted':
        await sendOfferAcceptedOrDeclinedConfirmation(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'offerDeclined':
        await sendOfferAcceptedOrDeclinedConfirmation(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case "userRequestAppAccess":
        await requestAppAccessEmail(recipient, notification)
          .then(() => notification.email.isSent = true)
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
  const urlToUse = applicationUrl[notification._meta.createdFrom];
  const orgData = getOrgEmailData(org);
  const toAdmin = getUserEmailData(recipient);
  const userSubject = getUserEmailData(notification.user);

  // Send an email to org's admin to let them know they have a request to join their org
  const template = userRequestedToJoinYourOrg(toAdmin, userSubject, orgData, urlToUse);

  const appKey = notification._meta.createdFrom;

  return sendMailFromTemplate(template, appKey, groupIds.unsubscribeAll);
}

async function sendPendingRequestToJoinOrgEmail(notification: NotificationDocument) {
  const appKey = notification._meta.createdFrom;
  const org = getOrgEmailData(notification.organization);
  const toUser = getUserEmailData(notification.user);

  // Send an email to the user who did the request to let him know its request has been sent
  const templateRequest = userJoinOrgPendingRequest(toUser, org);

  return sendMailFromTemplate(templateRequest, appKey, groupIds.unsubscribeAll);
}

async function sendOrgMemberUpdatedEmail(recipient: User, notification: NotificationDocument) {
  const org = await getDocument<OrganizationDocument>(`orgs/${notification.organization.id}`);
  const toAdmin = getUserEmailData(recipient);

  if (org.userIds.includes(notification.user.uid)) {
    const userSubject = getUserEmailData(notification.user);
    const orgData = getOrgEmailData(org);

    const template = userJoinedYourOrganization(toAdmin, orgData, userSubject);

    const appKey = notification._meta.createdFrom;
    return sendMailFromTemplate(template, appKey, groupIds.unsubscribeAll);
  } else {
    // Member left/removed from org
    const userSubject = getUserEmailData(notification.user); // user removed
    const app = notification._meta.createdFrom;
    const orgData = getOrgEmailData(org);
    const template = userLeftYourOrganization(toAdmin, userSubject, orgData);
    await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
  }

}

/** Send a reminder email 24h or 1h before event starts */
async function sendReminderEmails(recipient: User, notification: NotificationDocument, template: string) {
  const event = await getDocument<EventDocument<Screening>>(`events/${notification.docId}`);
  const org = await getDocument<OrganizationDocument>(`orgs/${event.ownerOrgId}`);
  const orgData = getOrgEmailData(org);
  const toUser = getUserEmailData(recipient)
  const eventData = getEventEmailData(event, recipient.email, notification.invitation?.id);

  const email = reminderEventToUser(toUser, orgData, eventData, template);
  return await sendMailFromTemplate(email, eventAppKey, groupIds.unsubscribeAll);
}

/** Send an email when an request to access an event is updated */
async function sendRequestToAttendEventUpdatedEmail(recipient: User, notification: NotificationDocument) {
  const invitation = await getDocument<InvitationDocument>(`invitations/${notification.invitation.id}`);

  if (invitation.toOrg) {
    const organizerOrg = await getDocument<OrganizationDocument>(`orgs/${notification.organization.id}`);
    const organizerOrgData = getOrgEmailData(organizerOrg);
    const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
    const toUser = getUserEmailData(recipient);
    const eventData = getEventEmailData(event);
    if (notification.invitation.status === 'accepted') {
      const template = requestToAttendEventFromUserAccepted(toUser, organizerOrgData, eventData);
      await sendMailFromTemplate(template, eventAppKey, groupIds.unsubscribeAll);
    } else {
      const template = requestToAttendEventFromUserRefused(toUser, organizerOrgData, eventData, notification.organization.id);
      await sendMailFromTemplate(template, eventAppKey, groupIds.unsubscribeAll);
    }
  } else {
    throw new Error('Invitation with mode === "request" can only have "toOrg" attribute');
  }

  return;
}

/** Send an email when an invitation to access an event is updated */
async function sendInvitationToAttendEventUpdatedEmail(recipient: User, notification: NotificationDocument) {
  const invitation = await getDocument<InvitationDocument>(`invitations/${notification.invitation.id}`);
  if (invitation.fromOrg) {
    const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
    const user = await getDocument<User>(`users/${notification.user.uid}`);
    const userOrg = await getDocument<OrganizationDocument>(`orgs/${user.orgId}`);
    const eventData = getEventEmailData(event, user.email, notification.invitation.id);
    const userOrgData = getOrgEmailData(userOrg);
    const userSubject = getUserEmailData(user);
    const toAdmin = getUserEmailData(recipient);

    if (notification.invitation.status === 'accepted') {
      const templateId = templateIds.invitation.attendEvent.accepted;
      const template = invitationToEventFromOrgUpdated(toAdmin, userSubject, userOrgData, eventData, invitation.fromOrg.id, templateId);
      return sendMailFromTemplate(template, eventAppKey, groupIds.unsubscribeAll);
    } else {
      const templateId = templateIds.invitation.attendEvent.declined;
      const template = invitationToEventFromOrgUpdated(toAdmin, userSubject, userOrgData, eventData, invitation.fromOrg.id, templateId);
      return sendMailFromTemplate(template, eventAppKey, groupIds.unsubscribeAll);
    }
  } else {
    throw new Error('Invitation with mode === "invitation" can only have "fromOrg" attribute');
  }

  return;
}

/** Send an email to org admin when his/her org is accepted */
async function sendMailToOrgAcceptedAdmin(recipient: User, notification: NotificationDocument) {
  const app = await getOrgAppKey(notification.organization.id);
  const toAdmin = getUserEmailData(recipient);
  const urlToUse = applicationUrl[app];
  const template = organizationWasAccepted(toAdmin, urlToUse);
  await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** Send email to organization's admins when org appAccess has changed */
async function sendOrgAppAccessChangedEmail(recipient: User, notification: NotificationDocument) {
  const app = notification.appAccess;
  const url = applicationUrl[app];
  const toAdmin = getUserEmailData(recipient);
  const template = organizationAppAccessChanged(toAdmin, url, notification.appAccess);
  await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

async function sendRequestToAttendEventCreatedEmail(recipient: User, notification: NotificationDocument) {
  const eventDoc = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
  const org = await getDocument<OrganizationDocument>(`orgs/${notification.user.orgId}`);
  const userOrg = getOrgEmailData(org);
  const userSubject = getUserEmailData(notification.user);
  const eventData: EventEmailData = getEventEmailData(eventDoc, userSubject.email, notification.invitation.id);
  const link = getEventLink({
    invitation: notification.invitation,
    eventData: eventData,
    org: org,
    email: userSubject.email
  });
  const urlToUse = applicationUrl[eventAppKey];
  const toAdmin = getUserEmailData(recipient);

  logger.log(`Sending request email to attend an event (${notification.docId}) from ${notification.user.uid} to : ${toAdmin.email}`);
  const templateRequest = requestToAttendEventFromUser(toAdmin, userSubject, userOrg, eventData, link, urlToUse);
  return sendMailFromTemplate(templateRequest, eventAppKey, groupIds.unsubscribeAll).catch(e => logger.warn(e.message));
}

async function sendInvitationToAttendEventCreatedEmail(recipient: User, notification: NotificationDocument) {
  const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
  const eventEmailData: EventEmailData = getEventEmailData(event, recipient.email, notification.invitation.id);
  const org = await getDocument<OrganizationDocument>(`orgs/${notification.organization.id}`);
  const toUser = getUserEmailData(recipient);
  const urlToUse = applicationUrl[eventAppKey];
  const orgData = getOrgEmailData(org);
  const link = getEventLink({
    invitation: notification.invitation,
    eventData: eventEmailData,
    org: org,
    email: recipient.email
  });
  logger.log(`Sending invitation email for an event (${notification.docId}) from ${orgData.denomination} to : ${toUser.email}`);
  const templateInvitation = invitationToEventFromOrg(toUser, orgData, eventEmailData, link, urlToUse);
  return sendMailFromTemplate(templateInvitation, eventAppKey, groupIds.unsubscribeAll).catch(e => logger.warn(e.message));
}

function getEventLink(data: { invitation: PublicInvitation, eventData: EventEmailData, org: OrganizationDocument, email: string }) {
  const { invitation, eventData, org, email } = data;
  const isPrivateInvitation = invitation.mode === 'invitation' && eventData.accessibility === 'private';
  if (invitation.mode === 'request' || isPrivateInvitation) {
    if (canAccessModule('marketplace', org)) {
      return '/c/o/marketplace/invitations';
    } else if (canAccessModule('dashboard', org)) {
      return '/c/o/dashboard/invitations';
    } else {
      return '';
    }
  } else {
    return `/event/${eventData.id}/r/i?email=${email}&i=${invitation.id}`;
  }
}

/** Send an email to org admin when his/her org is accepted */
async function sendMovieAcceptedEmail(recipient: User, notification: NotificationDocument) {
  const movie = await getDocument<MovieDocument>(`movies/${notification.docId}`);
  const movieUrl = `c/o/dashboard/title/${movie.id}`;
  const toUser = getUserEmailData(recipient);

  const app = notification._meta.createdFrom;
  const template = movieAcceptedEmail(toUser, movie.title.international, movieUrl);
  await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** Send an email to user when their request to attend an event has been sent */
async function sendRequestToAttendSentEmail(recipient: User, notification: NotificationDocument) {
  const event = await getDocument<EventDocument<EventMeta>>(`events/${notification.docId}`);
  const eventEmailData: EventEmailData = getEventEmailData(event, recipient.email, notification.invitation.id);
  const org = await getDocument<OrganizationDocument>(`orgs/${event.ownerOrgId}`);
  const organizerOrg = getOrgEmailData(org);
  const toUser = getUserEmailData(recipient);

  const app = notification._meta.createdFrom;
  const template = requestToAttendEventFromUserSent(toUser, eventEmailData, organizerOrg);
  await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** Let admins knows their invitation to an user to join their org has been declined */
async function sendInvitationDeclinedToJoinOrgEmail(recipient: User, notification: NotificationDocument) {
  const userSubject = getUserEmailData(notification.user)
  const toAdmin = getUserEmailData(recipient);

  const app = notification._meta.createdFrom;
  const template = invitationToJoinOrgDeclined(toAdmin, userSubject);
  await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** Let user knows that his request to join an org has been declined */
async function sendRequestToJoinOrgDeclined(recipient: User, notification: NotificationDocument) {
  const org = await getDocument<OrganizationDocument>(`orgs/${recipient.orgId}`);
  const orgData = getOrgEmailData(org);
  const toUser = getUserEmailData(notification.user);
  const app = notification._meta.createdFrom;
  const template = requestToJoinOrgDeclined(toUser, orgData);
  await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** Send copy of offer that buyer has created to all non-buyer stakeholders */
async function sendContractCreated(recipient: User, notification: NotificationDocument) {
  const app: App = 'catalog';
  const toUser = getUserEmailData(recipient);
  const movie = await getDocument<Movie>(`movies/${notification.docId}`)
  const contract = await getDocument<ContractDocument>(`contracts/${notification.docId}`)
  const buyerOrg = await getDocument<OrganizationDocument>(`orgs/${contract.buyerId}`)
  const negotiation = await getDocument<NegotiationDocument>(notification.docPath)
  const template = contractCreatedEmail(toUser, movie.title?.international, 'catalog', contract, negotiation, buyerOrg);
  return sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** Send copy of offer that recipient has created */
async function sendOfferCreatedConfirmation(recipient: User, notification: NotificationDocument) {
  const org = await getDocument<OrganizationDocument>(`orgs/${recipient.orgId}`);
  const offer = await getDocument<Offer>(`offers/${notification.docId}`);
  const buyerOrg = await getDocument<OrganizationDocument>(`orgs/${offer.buyerId}`);
  const app: App = 'catalog';
  const toUser = getUserEmailData(recipient);
  const adminTemplate = offerCreatedConfirmationEmail(toUser, org, notification.bucket);
  const buyerTemplate = buyerOfferCreatedConfirmationEmail(toUser, buyerOrg, offer.id, notification.bucket);
  await Promise.all([
    sendMailFromTemplate(adminTemplate, app, groupIds.unsubscribeAll),
    sendMailFromTemplate(buyerTemplate, app, groupIds.unsubscribeAll)
  ]);
}

/** Send notification to creator and recipient of counter offer */
async function sendNegotiationCreatedConfirmation(recipient: User, notification: NotificationDocument) {
  const path = notification.docPath;
  const contractId = path.split('/')[1]
  const contract = await getDocument<ContractDocument>(`contracts/${contractId}`);
  const negotiation = await getDocument<NegotiationDocument>(`${path}`);
  const recipientOrgId = negotiation.stakeholders.find(stakeholder =>
    ![negotiation.createdByOrg, centralOrgId.catalog].includes(stakeholder)
    )
  const title = await getDocument<MovieDocument>(`movies/${negotiation.titleId}`);
  const creatorOrg = await getDocument<OrganizationDocument>(`orgs/${negotiation.createdByOrg}`);
  const recipientOrg = await getDocument<OrganizationDocument>(`orgs/${recipientOrgId}`);
  const isRecipientBuyer = recipient.orgId === negotiation.createdByOrg && recipient.orgId !== negotiation.sellerId;
  const app: App = 'catalog';
  const toUser = getUserEmailData(recipient);
  const recipientTemplate = counterOfferRecipientEmail(toUser, recipientOrg, contract.offerId, title, contract.id, { isRecipientBuyer });
  const creatorTemplate = counterOfferCreatorEmail(toUser, creatorOrg, contract.offerId, negotiation, contract.id, { isRecipientBuyer });
  return Promise.all([
     sendMailFromTemplate(recipientTemplate, app, groupIds.unsubscribeAll),
     sendMailFromTemplate(creatorTemplate, app, groupIds.unsubscribeAll),
  ]);
}

async function fetchContractUpdatedEmailData(recipient: User, notification: NotificationDocument) {
  const path = notification.docPath;
  const contractId = notification.docId;
  const contract = await getDocument<ContractDocument>(`contracts/${contractId}`);
  const negotiation = await getDocument<NegotiationDocument>(`${path}`);
  const recipientOrg = await getDocument<OrganizationDocument>(`orgs/${recipient.orgId}`);
  const title = await getDocument<MovieDocument>(`movies/${negotiation.titleId}`);
  const app: App = 'catalog';

  const isRecipientBuyer = recipient.orgId === negotiation.createdByOrg && recipient.orgId !== negotiation.sellerId;
  const toUser = getUserEmailData(recipient);
  return {
    path, contractId, contract, negotiation, title, app,
    isRecipientBuyer, toUser, recipientOrg
  };
}

/** Send notification to creator of counter offer */
async function sendContractAcceptedConfirmation(recipient: User, notification: NotificationDocument) {
  const {
    contract, title, app, isRecipientBuyer, toUser, recipientOrg
  } = await fetchContractUpdatedEmailData(recipient, notification);

  const config = { isRecipientBuyer, isActionDeclined: false, didRecipientAcceptOrDecline: false } as const;

  const template = negotiationEmail(toUser, contract.offerId, title, contract.id, recipientOrg, config);
  return sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** Send notification to recipient of counter offer */
async function sendAcceptedContractConfirmation(recipient: User, notification: NotificationDocument) {
  const {
    contract, title, app, isRecipientBuyer, toUser, recipientOrg
  } = await fetchContractUpdatedEmailData(recipient, notification);

  const config = { isRecipientBuyer, isActionDeclined: false, didRecipientAcceptOrDecline: true } as const;

  const template = negotiationEmail(toUser, contract.offerId, title, contract.id, recipientOrg, config);
  return sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}


/** Send notification to creator of counter offer */
async function sendContractDeclinedConfirmation(recipient: User, notification: NotificationDocument) {
  const {
    contract, title, app, isRecipientBuyer, toUser, recipientOrg
  } = await fetchContractUpdatedEmailData(recipient, notification);

  const config = { isRecipientBuyer, isActionDeclined: true, didRecipientAcceptOrDecline: false } as const;

  const template = negotiationEmail(toUser, contract.offerId, title, contract.id, recipientOrg, config);
  return sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** Send notification to recipient of counter offer */
async function sendDeclinedContractConfirmation(recipient: User, notification: NotificationDocument) {
  const {
    contract, title, app, isRecipientBuyer, toUser, recipientOrg
  } = await fetchContractUpdatedEmailData(recipient, notification);

  const config = { isRecipientBuyer, isActionDeclined: true, didRecipientAcceptOrDecline: true } as const;

  const template = negotiationEmail(toUser, contract.offerId, title, contract.id, recipientOrg, config);
  return sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}


async function sendOfferAcceptedOrDeclinedConfirmation(recipient: User, notification: NotificationDocument) {
  const offer = await getDocument<Offer>(`offers/${notification.docId}`);
  const contractsSnap = await admin.firestore().collection('contracts').where('offerId', '==', offer.id).get();
  const contracts = contractsSnap.docs.map(doc => doc.data() as ContractDocument);
  const negotiationPromises = contracts.map(async contract => {
    const ref = admin.firestore().collection(`contracts/${contract.id}/negotiations`)
      .orderBy('_meta.createdAt', 'desc').limit(1);
    const negoSnap = await ref.get();
    return negoSnap.docs[0]?.data() as NegotiationDocument;
  });
  const titlePromises = contracts.map(async contract => {
    return await getDocument<MovieDocument>(`movies/${contract.titleId}`);
  });
  const negotiations = await Promise.all(negotiationPromises);
  const mailNegotiations = negotiations.map(nego => ({
    ...nego,
    terms: nego.terms.map(term => ({
      ...term,
      duration: {
        from: format(term.duration.from.toDate(), 'dd MMMM, yyyy'),
        to: format(term.duration.to.toDate(), 'dd MMMM, yyyy')
      }
    }))
  }))
  const titles = await Promise.all(titlePromises);

  contracts.forEach((contract, index) => contract['negotiation'] = mailNegotiations[index]);
  contracts.forEach((contract, index) => contract['title'] = titles[index].title.international);
  const toUser = getUserEmailData(recipient);
  const app: App = 'catalog';
  offer['currency_long'] = movieCurrencies[offer.currency]
  offer['isOfferAccepted'] = offer.status === 'accepted'

  const template = offerAcceptedOrDeclined(toUser, offer, contracts);
  return sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** User receive a notification and an email to confirm his request access has been sent*/
async function requestAppAccessEmail(recipient: User, notification: NotificationDocument) {
  const userDoc = await getDocument<User>(`users/${notification.user.uid}`);
  const user = getUserEmailData(userDoc);
  const app = notification._meta.createdFrom;
  const template = appAccessEmail(recipient.email, user);
  await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}
