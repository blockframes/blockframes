
import { getOrgAppKey } from './data/internals';
import {
  NotificationSettingsTemplate,
  User,
  canAccessModule,
  Event,
  EventMeta,
  NotificationTypes,
  Notification,
  Invitation,
  PublicInvitation,
  Screening,
  Offer,
  App,
  appName,
  Contract,
  Negotiation,
  Movie,
  Organization
} from '@blockframes/model';
import { sendMailFromTemplate } from './internals/email';
import {
  emailErrorCodes,
  EventEmailData,
  getEventEmailData,
  getMovieEmailData,
  getOrgEmailData,
  getUserEmailData
} from '@blockframes/utils/emails/utils';
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
  invitationToEventFromOrgUpdated,
  userJoinOrgPendingRequest,
  adminOfferCreatedConfirmationEmail,
  appAccessEmail,
  contractCreatedEmail,
  buyerOfferCreatedConfirmationEmail,
  counterOfferRecipientEmail,
  counterOfferSenderEmail,
  screeningRequestedToSeller,
  movieAskingPriceRequested,
  movieAskingPriceRequestSent,
  toAdminCounterOfferEmail,
  // #7946 this may be reactivated later
  // offerUnderSignature,
  // offerAcceptedOrDeclined,
} from './templates/mail';
import { templateIds, groupIds } from '@blockframes/utils/emails/ids';
import { applicationUrl } from '@blockframes/utils/apps';
import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';
import { appUrl, supportEmails } from './environments/environment';
import { getReviewer } from '@blockframes/contract/negotiation/utils';
import { getDocument, BlockframesSnapshot } from '@blockframes/firebase-utils';
// #7946 this may be reactivated later
// import { movieCurrencies, createMailContract, MailContract } from '@blockframes/model';

// @TODO (#2848) forcing to festival since invitations to events are only on this one
const eventAppKey: App = 'festival';

/** Takes one or more notifications and add them on the notifications collection */
export async function triggerNotifications(notifications: Notification[]) {
  const db = admin.firestore();
  const batch = db.batch();

  for (const n of notifications) {
    const notification = await appendNotificationSettings(n);

    if (!notification.id) {
      notification.id = db.collection('notifications').doc().id;
    }

    const notificationRef = db.collection('notifications').doc(notification.id);
    batch.set(notificationRef, notification);
  }

  return batch.commit();
}

async function appendNotificationSettings(notification: Notification) {
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
  const serverOnlyNotifications: NotificationTypes[] = [
    // we already have an invitation that will always be displayed instead
    'requestFromUserToJoinOrgCreate',
    'requestToAttendEventCreated',
    'invitationToAttendScreeningCreated',
    'invitationToAttendSlateCreated',
    'invitationToAttendMeetingCreated',

    // notifications only used to send email
    'requestFromUserToJoinOrgPending',
    'userRequestAppAccess',

    // these notifications are used to send emails after a screening, not to be displayed in front
    'userMissedScreening',
    'userAttendedScreening'
  ];

  if (serverOnlyNotifications.includes(notification.type)) {
    delete notification.app;
  }

  return notification;
}

export async function onNotificationCreate(snap: BlockframesSnapshot<Notification>) {
  const notification = snap.data();

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
      case 'movieAskingPriceRequested':
        await sendMovieAskingPriceRequested(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'movieAskingPriceRequestSent':
        await sendMovieAskingPriceRequestSent(recipient, notification)
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
      case 'invitationToAttendSlateCreated':
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
      case 'screeningRequested':
        await sendScreeningRequested(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'screeningRequestSent':
        // No email is sent to user that requested the screening, only a notification
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

      case 'createdCounterOffer':
        await sendCreatedCounterOfferConfirmation(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;

      case 'receivedCounterOffer':
        await sendReceivedCounterOfferConfirmation(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;

      case 'myOrgAcceptedAContract': {
        const orgAcceptedContractConfig = { isActionDeclined: false, didRecipientAcceptOrDecline: true } as const;
        await sendContractStatusChangedConfirmation(recipient, notification, orgAcceptedContractConfig)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      }

      case 'myContractWasAccepted': {
        const orgContractWasAcceptedConfig = { isActionDeclined: false, didRecipientAcceptOrDecline: false } as const;
        await sendContractStatusChangedConfirmation(recipient, notification, orgContractWasAcceptedConfig)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      }
      case 'myOrgDeclinedAContract': {
        const orgDeclinedContractConfig = { isActionDeclined: true, didRecipientAcceptOrDecline: true } as const;
        await sendContractStatusChangedConfirmation(recipient, notification, orgDeclinedContractConfig)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      }
      case 'myContractWasDeclined': {
        const orgContractWasDeclinedConfig = { isActionDeclined: true, didRecipientAcceptOrDecline: false } as const;
        await sendContractStatusChangedConfirmation(recipient, notification, orgContractWasDeclinedConfig)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      }
      // #7946 this may be reactivated later
      // case 'offerAccepted':
      //   await sendOfferAcceptedOrDeclinedConfirmation(recipient, notification)
      //     .then(() => notification.email.isSent = true)
      //     .catch(e => notification.email.error = e.message);
      //   break;
      // case 'offerDeclined':
      //   await sendOfferAcceptedOrDeclinedConfirmation(recipient, notification)
      //     .then(() => notification.email.isSent = true)
      //     .catch(e => notification.email.error = e.message);
      //   break;
      // case 'underSignature':
      //   await sendOfferUnderSignatureConfirmation(recipient, notification)
      //     .then(() => notification.email.isSent = true)
      //     .catch(e => notification.email.error = e.message);
      //   break;
      case 'userRequestAppAccess':
        await requestAppAccessEmail(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'userMissedScreening':
        await missedScreeningEmail(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      case 'userAttendedScreening':
        await attendedScreeningEmail(recipient, notification)
          .then(() => notification.email.isSent = true)
          .catch(e => notification.email.error = e.message);
        break;
      default:
        notification.email.error = emailErrorCodes.noTemplate.code;
        break;
    }

    // ! TODO  #8376 Don't do this - unify instantiation of Firestore
    const db = admin.firestore();
    await db.collection('notifications').doc(notification.id).set({ email: notification.email }, { merge: true });
  }
}

async function sendUserRequestedToJoinYourOrgEmail(recipient: User, notification: Notification) {
  const org = await getDocument<Organization>(`orgs/${notification.organization.id}`);
  const urlToUse = applicationUrl[notification._meta.createdFrom];
  const orgData = getOrgEmailData(org);
  const toAdmin = getUserEmailData(recipient);
  const userSubject = getUserEmailData(notification.user);

  // Send an email to org's admin to let them know they have a request to join their org
  const template = userRequestedToJoinYourOrg(toAdmin, userSubject, orgData, urlToUse);

  const appKey = notification._meta.createdFrom;

  return sendMailFromTemplate(template, appKey, groupIds.unsubscribeAll);
}

async function sendPendingRequestToJoinOrgEmail(notification: Notification) {
  const appKey = notification._meta.createdFrom;
  const org = getOrgEmailData(notification.organization);
  const toUser = getUserEmailData(notification.user);

  // Send an email to the user who did the request to let him know its request has been sent
  const templateRequest = userJoinOrgPendingRequest(toUser, org);

  return sendMailFromTemplate(templateRequest, appKey, groupIds.unsubscribeAll);
}

async function sendOrgMemberUpdatedEmail(recipient: User, notification: Notification) {
  const org = await getDocument<Organization>(`orgs/${notification.organization.id}`);
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
async function sendReminderEmails(recipient: User, notification: Notification, template: string) {
  const event = await getDocument<Event<Screening>>(`events/${notification.docId}`);
  const org = await getDocument<Organization>(`orgs/${event.ownerOrgId}`);
  const orgData = getOrgEmailData(org);
  const toUser = getUserEmailData(recipient)
  const eventData = getEventEmailData({ event, orgName: orgData.name, email: recipient.email, invitationId: notification.invitation?.id });

  const email = reminderEventToUser(toUser, orgData, eventData, template);
  return await sendMailFromTemplate(email, eventAppKey, groupIds.unsubscribeAll);
}

/** Send an email when an request to access an event is updated */
async function sendRequestToAttendEventUpdatedEmail(recipient: User, notification: Notification) {
  const invitation = await getDocument<Invitation>(`invitations/${notification.invitation.id}`);

  if (invitation.toOrg) {
    const organizerOrg = await getDocument<Organization>(`orgs/${notification.organization.id}`);
    const organizerOrgData = getOrgEmailData(organizerOrg);
    const event = await getDocument<Event<EventMeta>>(`events/${notification.docId}`);
    const toUser = getUserEmailData(recipient);

    if (notification.invitation.status === 'accepted') {
      const eventData = getEventEmailData({ event, orgName: organizerOrgData.name });
      const template = requestToAttendEventFromUserAccepted(toUser, organizerOrgData, eventData);
      await sendMailFromTemplate(template, eventAppKey, groupIds.unsubscribeAll);
    } else {
      const eventData = getEventEmailData({ event, orgName: organizerOrgData.name, attachment: false });
      const template = requestToAttendEventFromUserRefused(toUser, organizerOrgData, eventData, notification.organization.id);
      await sendMailFromTemplate(template, eventAppKey, groupIds.unsubscribeAll);
    }
  } else {
    throw new Error('Invitation with mode === "request" can only have "toOrg" attribute');
  }

  return;
}

/** Send an email when an invitation to access an event is updated */
async function sendInvitationToAttendEventUpdatedEmail(recipient: User, notification: Notification) {
  const invitation = await getDocument<Invitation>(`invitations/${notification.invitation.id}`);
  if (invitation.fromOrg) {
    const event = await getDocument<Event<EventMeta>>(`events/${notification.docId}`);
    const user = await getDocument<User>(`users/${notification.user.uid}`);
    const userOrg = await getDocument<Organization>(`orgs/${user.orgId}`);
    const userOrgData = getOrgEmailData(userOrg);
    const eventData = getEventEmailData({ event, orgName: userOrgData.name, email: user.email, invitationId: notification.invitation.id, attachment: false });
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
}

/** Send an email to users of orgs of movie to request a screening */
async function sendScreeningRequested(recipient: User, notification: Notification) {
  const movie = await getDocument<Movie>(`movies/${notification.docId}`);
  const requestor = await getDocument<User>(`users/${notification.user.uid}`);
  const buyerOrg = await getDocument<Organization>(`orgs/${requestor.orgId}`);
  const toUser = getUserEmailData(recipient);

  const template = screeningRequestedToSeller(
    toUser,
    getUserEmailData(requestor),
    getOrgEmailData(buyerOrg),
    getMovieEmailData(movie)
  );
  await sendMailFromTemplate(template, 'festival', groupIds.unsubscribeAll);
}

/** Send an email to org admin when his/her org is accepted */
async function sendMailToOrgAcceptedAdmin(recipient: User, notification: Notification) {
  const app = await getOrgAppKey(notification.organization.id);
  const toAdmin = getUserEmailData(recipient);
  const urlToUse = applicationUrl[app];
  const template = organizationWasAccepted(toAdmin, urlToUse);
  await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** Send email to organization's admins when org appAccess has changed */
async function sendOrgAppAccessChangedEmail(recipient: User, notification: Notification) {
  const app = notification.appAccess;
  const url = applicationUrl[app];
  const toAdmin = getUserEmailData(recipient);
  const template = organizationAppAccessChanged(toAdmin, url, notification.appAccess);
  await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

async function sendRequestToAttendEventCreatedEmail(recipient: User, notification: Notification) {
  const event = await getDocument<Event<EventMeta>>(`events/${notification.docId}`);
  const org = await getDocument<Organization>(`orgs/${notification.user.orgId}`);
  const userOrg = getOrgEmailData(org);
  const userSubject = getUserEmailData(notification.user);
  const eventData: EventEmailData = getEventEmailData({ event, orgName: userOrg.name, email: userSubject.email, invitationId: notification.invitation.id, attachment: false });
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

async function sendInvitationToAttendEventCreatedEmail(recipient: User, notification: Notification) {
  const event = await getDocument<Event<EventMeta>>(`events/${notification.docId}`);
  const org = await getDocument<Organization>(`orgs/${notification.organization.id}`);
  const orgData = getOrgEmailData(org);
  const eventEmailData: EventEmailData = getEventEmailData({ event, orgName: orgData.name, email: recipient.email, invitationId: notification.invitation.id });
  const toUser = getUserEmailData(recipient);
  const urlToUse = applicationUrl[eventAppKey];
  const link = getEventLink({
    invitation: notification.invitation,
    eventData: eventEmailData,
    org: org,
    email: recipient.email
  });
  logger.log(`Sending invitation email for an event (${notification.docId}) from ${orgData.name} to : ${toUser.email}`);
  const templateInvitation = invitationToEventFromOrg(toUser, orgData, eventEmailData, link, urlToUse);
  return sendMailFromTemplate(templateInvitation, eventAppKey, groupIds.unsubscribeAll).catch(e => logger.warn(e.message));
}

function getEventLink(data: { invitation: PublicInvitation, eventData: EventEmailData, org: Organization, email: string }) {
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
async function sendMovieAcceptedEmail(recipient: User, notification: Notification) {
  const movie = await getDocument<Movie>(`movies/${notification.docId}`);
  const movieUrl = `c/o/dashboard/title/${movie.id}`;
  const toUser = getUserEmailData(recipient);

  const app = notification._meta.createdFrom;
  const template = movieAcceptedEmail(toUser, movie.title.international, movieUrl);
  await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** Send an email to orgs of a movie about the fact that someone requested the asking price */
async function sendMovieAskingPriceRequested(recipient: User, notification: Notification) {
  const movie = await getDocument<Movie>(`movies/${notification.docId}`);
  const toUser = getUserEmailData(recipient);
  const buyer = getUserEmailData(notification.user);
  const buyerOrg = await getDocument<Organization>(`orgs/${notification.user.orgId}`);
  const { territories, message } = notification.data;

  const app = notification._meta.createdFrom;
  const template = movieAskingPriceRequested(
    toUser,
    buyer,
    getOrgEmailData(buyerOrg),
    getMovieEmailData(movie),
    territories,
    message
  );
  await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** Send an email to user when their request for the asking price has been sent */
async function sendMovieAskingPriceRequestSent(recipient: User, notification: Notification) {
  const movie = await getDocument<Movie>(`movies/${notification.docId}`);
  const toUser = getUserEmailData(recipient);
  const { territories, message } = notification.data;

  const orgs = await Promise.all(
    movie.orgIds.map(orgId => getDocument<Organization>(`orgs/${orgId}`))
  );
  const orgNames = orgs.map(org => org.name).join(', ');

  const app = notification._meta.createdFrom;
  const template = movieAskingPriceRequestSent(toUser, getMovieEmailData(movie), orgNames, territories, message);
  await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** Send an email to user when their request to attend an event has been sent */
async function sendRequestToAttendSentEmail(recipient: User, notification: Notification) {
  const event = await getDocument<Event<EventMeta>>(`events/${notification.docId}`);
  const org = await getDocument<Organization>(`orgs/${event.ownerOrgId}`);
  const organizerOrg = getOrgEmailData(org);
  const eventEmailData: EventEmailData = getEventEmailData({ event, orgName: organizerOrg.name, email: recipient.email, invitationId: notification.invitation.id, attachment: false });
  const toUser = getUserEmailData(recipient);

  const app = notification._meta.createdFrom;
  const template = requestToAttendEventFromUserSent(toUser, eventEmailData, organizerOrg);
  await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/** Send copy of offer that buyer has created to all non-buyer stakeholders */
async function sendContractCreated(recipient: User, notification: Notification) {
  const app: App = 'catalog';
  const toUser = getUserEmailData(recipient);
  const [contract, negotiation] = await Promise.all([
    getDocument<Contract>(`contracts/${notification.docId}`),
    getDocument<Negotiation>(notification.docPath),
  ]);
  const [title, buyerOrg] = await Promise.all([
    getDocument<Movie>(`movies/${contract.titleId}`),
    getDocument<Organization>(`orgs/${contract.buyerId}`),
  ]);
  const template = contractCreatedEmail(toUser, title, contract, negotiation, getOrgEmailData(buyerOrg));
  return sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

/**Send copy of offer to catalog admin and buyer who created the offer */
async function sendOfferCreatedConfirmation(recipient: User, notification: Notification) {
  const [org, offer] = await Promise.all([
    getDocument<Organization>(`orgs/${recipient.orgId}`),
    getDocument<Offer>(`offers/${notification.docId}`),
  ]);
  const buyerOrg = await getDocument<Organization>(`orgs/${offer.buyerId}`);
  const app: App = 'catalog';
  const toUser = getUserEmailData(recipient);
  const adminTemplate = adminOfferCreatedConfirmationEmail(toUser, getOrgEmailData(org), notification.bucket);
  const buyerTemplate = buyerOfferCreatedConfirmationEmail(toUser, getOrgEmailData(buyerOrg), offer, notification.bucket);
  await Promise.all([
    sendMailFromTemplate(adminTemplate, app, groupIds.unsubscribeAll),
    sendMailFromTemplate(buyerTemplate, app, groupIds.unsubscribeAll)
  ]);
}

async function sendCreatedCounterOfferConfirmation(recipient: User, notification: Notification) {
  const path = notification.docPath;
  const contractId = path.split('/')[1]
  const [contract, negotiation] = await Promise.all([
    getDocument<Contract>(`contracts/${contractId}`),
    getDocument<Negotiation>(`${path}`),
  ]);
  const recipientOrgId = getReviewer(negotiation);
  const recipientOrg = await getDocument<Organization>(`orgs/${recipientOrgId}`);
  const title = await getDocument<Movie>(`movies/${negotiation.titleId}`);
  const isMailRecipientBuyer = recipient.orgId === negotiation.buyerId;
  const app: App = 'catalog';
  const toUser = getUserEmailData(recipient);
  const recipientOrgEmailData = getOrgEmailData(recipientOrg);

  const senderTemplate = counterOfferSenderEmail(toUser, recipientOrgEmailData, contract.offerId, negotiation, title, contract.id, { isMailRecipientBuyer });
  const adminTemplate = toAdminCounterOfferEmail(title, contract.offerId);

  return Promise.all([
    sendMailFromTemplate(senderTemplate, app, groupIds.unsubscribeAll),
    sendMailFromTemplate(adminTemplate, app, groupIds.unsubscribeAll)
  ]);
}

async function sendReceivedCounterOfferConfirmation(recipient: User, notification: Notification) {
  const path = notification.docPath;
  const contractId = path.split('/')[1]
  const [contract, negotiation] = await Promise.all([
    getDocument<Contract>(`contracts/${contractId}`),
    getDocument<Negotiation>(`${path}`),
  ]);

  const [senderOrg, title] = await Promise.all([
    getDocument<Organization>(`orgs/${negotiation.createdByOrg}`),
    getDocument<Movie>(`movies/${negotiation.titleId}`),
  ]);
  const isMailRecipientBuyer = recipient.orgId === negotiation.buyerId;
  const app: App = 'catalog';
  const toUser = getUserEmailData(recipient);
  const senderOrgEmailData = getOrgEmailData(senderOrg);

  const recipientTemplate = counterOfferRecipientEmail(toUser, senderOrgEmailData, contract.offerId, title, contract.id, { isMailRecipientBuyer });
  return sendMailFromTemplate(recipientTemplate, app, groupIds.unsubscribeAll);
}

async function getNegotiationUpdatedEmailData(recipient: User, notification: Notification) {
  const { docPath: path, docId: contractId } = notification;
  const [contract, negotiation, recipientOrg] = await Promise.all([
    getDocument<Contract>(`contracts/${contractId}`),
    getDocument<Negotiation>(`${path}`),
    getDocument<Organization>(`orgs/${recipient.orgId}`),
  ]);
  const [counterOfferSenderOrg, title] = await Promise.all([
    getDocument<Organization>(`orgs/${negotiation.createdByOrg}`),
    getDocument<Movie>(`movies/${negotiation.titleId}`),
  ]);
  const app: App = 'catalog';

  const isRecipientBuyer = recipient.orgId === negotiation.buyerId;
  const toUser = getUserEmailData(recipient);
  return {
    path, contractId, contract, negotiation, title, app,
    isRecipientBuyer, toUser, recipientOrg, counterOfferSenderOrg
  };
}

type ContractUpdatedConfig = {
  didRecipientAcceptOrDecline: boolean,
  isActionDeclined: boolean,
}

async function sendContractStatusChangedConfirmation(recipient: User, notification: Notification, options: ContractUpdatedConfig) {
  const {
    contract, title, app, isRecipientBuyer, toUser, recipientOrg, counterOfferSenderOrg
  } = await getNegotiationUpdatedEmailData(recipient, notification);

  const pageUrl = isRecipientBuyer
    ? `${appUrl.content}/c/o/marketplace/offer/${contract.offerId}/${contract.id}`
    : `${appUrl.content}/c/o/dashboard/sales/${contract.id}/view`;

  const crmPageUrl = `${appUrl.crm}/c/o/dashboard/crm/offer/${contract.offerId}/view`;

  const termsUrl = isRecipientBuyer
    ? `${appUrl.content}/c/o/marketplace/terms`
    : `${appUrl.content}/c/o/dashboard/terms`;

  const data = {
    user: toUser,
    org: getOrgEmailData(recipientOrg),
    contract,
    movie: getMovieEmailData(title),
    pageUrl,
    crmPageUrl,
    termsUrl,
    app: { name: appName.catalog }
  };

  let templateId = templateIds.negotiation.myContractWasAccepted;
  let adminTemplateId;
  if (options.didRecipientAcceptOrDecline) {
    templateId = templateIds.negotiation.myOrgAcceptedAContract;
    adminTemplateId = templateIds.negotiation.toAdminContractAccepted;
    data.org = getOrgEmailData(counterOfferSenderOrg);
  }
  if (options.isActionDeclined) {
    templateId = templateIds.negotiation.myContractWasDeclined;
    if (options.didRecipientAcceptOrDecline) {
      templateId = templateIds.negotiation.myOrgDeclinedAContract;
      adminTemplateId = templateIds.negotiation.toAdminContractDeclined;
      data.org = getOrgEmailData(counterOfferSenderOrg);
    }
  }
  const template = { to: toUser.email, templateId, data };
  const mailToSend = [sendMailFromTemplate(template, app, groupIds.unsubscribeAll)];

  if (adminTemplateId) {
    const adminTemplate = { to: supportEmails.catalog, templateId: adminTemplateId, data };
    mailToSend.push(sendMailFromTemplate(adminTemplate, app, groupIds.unsubscribeAll))
  }
  return Promise.all(mailToSend);
}

// #7946 this may be reactivated later
// async function sendOfferAcceptedOrDeclinedConfirmation(recipient: User, notification: Notification) { //to check
//   const offer = await getDocument<Offer>(`offers/${notification.docId}`);
//   TODO use queryDocuments<Contract>()
//   const contractsSnap = await admin.firestore().collection('contracts').where('offerId', '==', offer.id).get();
//   const contracts = contractsSnap.docs.map(doc => doc.data() as ContractDocument);
//   const negotiationPromises = contracts.map(async contract => {
//     const ref = admin.firestore().collection(`contracts/${contract.id}/negotiations`)
//       .orderBy('_meta.createdAt', 'desc').limit(1);
//     const negoSnap = await ref.get();
//     return negoSnap.docs[0]?.data() as NegotiationDocument;
//   });
//   const titlePromises = contracts.map(async contract => {
//     return await getDocument<Movie>(`movies/${contract.titleId}`);
//   });
//   const negotiations = await Promise.all(negotiationPromises);
//   const titles = await Promise.all(titlePromises);
//   const mailNegotiations = negotiations.map(createMailContract);

//   contracts.forEach((contract, index) => contract['negotiation'] = mailNegotiations[index]);
//   contracts.forEach((contract, index) => contract['title'] = titles[index].title.international);
//   const toUser = getUserEmailData(recipient);
//   const app: App = 'catalog';
//   offer['currency_long'] = movieCurrencies[offer.currency]

//   const template = offerAcceptedOrDeclined(toUser, offer, contracts);
//   return sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
// }

// async function sendOfferUnderSignatureConfirmation(recipient: User, notification: Notification) {
//   const contract = await getDocument<Contract>(`contracts/${notification.docId}`);
//   const ref = admin.firestore().collection(`contracts/${contract.id}/negotiations`)
//     .orderBy('_meta.createdAt', 'desc').limit(1);
//   const negotiation = await ref.get().then(snap => snap.docs[0]?.data() as NegotiationDocument);
//   const movie = await getDocument<Movie>(`movies/${contract.titleId}`);


//   const mailContract: MailContract = createMailContract(negotiation);

//   const toUser = getUserEmailData(recipient);
//   const app: App = 'catalog';
//   mailContract['currency_long'] = movieCurrencies[negotiation.currency]

//   const template = offerUnderSignature(toUser, contract.offerId, contract, mailContract, movie.title.international);
//   return sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
// }

/** User receive a notification and an email to confirm his request access has been sent*/
async function requestAppAccessEmail(recipient: User, notification: Notification) {
  const userDoc = await getDocument<User>(`users/${notification.user.uid}`);
  const user = getUserEmailData(userDoc);
  const app = notification._meta.createdFrom;
  const template = appAccessEmail(recipient.email, user);
  await sendMailFromTemplate(template, app, groupIds.unsubscribeAll);
}

async function missedScreeningEmail(recipient: User, notification: Notification) {
  const event = await getDocument<Event<Screening>>(`events/${notification.docId}`);
  const orgDoc = await getDocument<Organization>(`orgs/${event.ownerOrgId}`);

  const data = {
    user: getUserEmailData(recipient),
    org: getOrgEmailData(orgDoc),
    event: getEventEmailData({ event, orgName: orgDoc.name, email: recipient.email, attachment: false }),
    pageUrl: `${appUrl.market}/c/o/marketplace/title/${event.meta.titleId}/main`
  }
  const template = { to: recipient.email, templateId: templateIds.invitation.attendEvent.missedScreening, data };

  await sendMailFromTemplate(template, 'festival', groupIds.unsubscribeAll);
}

async function attendedScreeningEmail(recipient: User, notification: Notification) {
  const event = await getDocument<Event<Screening>>(`events/${notification.docId}`);
  const [movie, orgDoc] = await Promise.all([
    getDocument<Movie>(`movies/${event.meta.titleId}`),
    getDocument<Organization>(`orgs/${event.ownerOrgId}`)
  ]);

  const data = {
    user: getUserEmailData(recipient),
    org: getOrgEmailData(orgDoc),
    movie: getMovieEmailData(movie),
    event: getEventEmailData({ event, orgName: orgDoc.name, email: recipient.email, attachment: false }),
    pageUrl: `${appUrl.market}/c/o/marketplace/title/${event.meta.titleId}/main`
  }
  const template = { to: recipient.email, templateId: templateIds.invitation.attendEvent.attendedScreening, data };

  await sendMailFromTemplate(template, 'festival', groupIds.unsubscribeAll);
}