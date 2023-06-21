import * as users from './users';
import * as consent from './consent';
import * as invitations from './invitation';
import * as mailchimp from './mailchimp';
import {
  functions,
  heavyConfig,
  hotConfig,
  skipInMaintenance,
  superHeavyConfig,
  onDocumentCreate,
  onDocumentDelete,
  onDocumentUpdate,
  onDocumentWrite
} from './internals/firebase';
import { logErrors } from './internals/sentry';
import { onInvitationWrite } from './invitation';
import { onOrganizationCreate, onOrganizationDelete, onOrganizationUpdate, accessToAppChanged, onRequestFromOrgToAccessApp } from './orgs';
import { onMovieUpdate, onMovieCreate, onMovieDelete, createAskingPriceRequest, createScreenerRequest } from './movie';
import * as bigQuery from './bigQuery';
import { onDocumentPermissionCreate, onPermissionDelete } from './permissions';
import { createNotificationsForEventsToStart, createNotificationsForFinishedScreenings } from './internals/invitations/events';
import { getPrivateVideoUrl, getPlayerUrl } from './player';
import { sendMailAsAdmin as _sendMailAsAdmin, sendMailWithTemplate as _sendMailWithTemplate } from './internals/email';
import { linkFile, getMediaToken as _getMediaToken } from './media';
import { onEventCreate, onEventDelete, createScreeningRequest } from './event';
import { getTwilioAccessToken, twilioWebhook as _twilioWebhook } from './twilio';
import { eventWebhook as sendgridEventWebhook } from './sendgrid';
import { onNotificationCreate } from './notification';
import { onOfferCreate } from './offer';
import { onContractDelete, onContractUpdate } from './contracts';
import { onTermDelete } from './terms';
import { downloadVideo } from './rescue';
import { createPdf as _createPdf } from './createPdf';
import { onNegotiationCreated, onNegotiationUpdate } from './negotiation';
import { buildWaterfall as _buildWaterfall, onWaterfallDocumentDelete, onWaterfallUpdate, removeWaterfallFile } from './waterfall';
import { projectId, storageBucket } from './environments/environment';

console.log('Function instance loaded');

//--------------------------------
//    Users Management          //
//--------------------------------

/** Trigger: REST call to create an user from CRM app. */
export const createUser = functions().https.onCall(skipInMaintenance(logErrors(users.createUser)));

/**
 * Trigger: when user creates an account.
 *
 * We create a corresponding document in `users/userID`.
 */
export const onUserCreate = functions().auth.user().onCreate(skipInMaintenance(logErrors(users.onUserCreate)));

export const onUserCreateDocument = onDocumentCreate('/users/{userID}', users.onUserCreateDocument);

// user update can potentially trigger images processing
export const onUserUpdate = onDocumentUpdate('/users/{userID}', users.onUserUpdate, heavyConfig);

export const onUserDelete = onDocumentDelete('/users/{userID}', users.onUserDelete);

/** Trigger: REST call to send a verify email to a user. */
export const sendVerifyEmailAddress = functions().https.onCall(skipInMaintenance(logErrors(users.startVerifyEmailFlow)));

/** Trigger: REST call to send a reset password link to a user. */
export const sendResetPasswordEmail = functions().https.onCall(skipInMaintenance(users.startResetPasswordEmail));

/** Trigger: REST call to manually verify email. */
export const verifyEmail = functions().https.onCall(skipInMaintenance(users.verifyEmail));

//--------------------------------
//        Misc Management       //
//--------------------------------

/** Trigger: REST call when an user contacts blockframes admin and send them an email. */
export const sendUserContactMail = functions().https.onCall(skipInMaintenance(logErrors(users.sendUserMail)));

/** Trigger: REST call to send a mail to an admin for demo request. */
export const sendDemoRequest = functions().https.onCall(skipInMaintenance(logErrors(users.sendDemoRequest)));

/** Trigger: REST call bigQuery to fetch analytics active users */
export const getAnalyticsActiveUsers = functions().https.onCall(skipInMaintenance(logErrors(bigQuery.getAnalyticsActiveUsers)));

export const registerToNewsletter = functions().https.onCall(skipInMaintenance(logErrors(mailchimp.registerToNewsletters)));

//--------------------------------
//      Player  Management      //
//--------------------------------

export const privateVideo = functions().https.onCall(skipInMaintenance(logErrors(getPrivateVideoUrl)));
export const playerUrl = functions().https.onCall(skipInMaintenance(logErrors(getPlayerUrl)));

//--------------------------------
//   Permissions  Management    //
//--------------------------------

/** Trigger: when a documentPermissions document is created. */
export const onDocumentPermissionCreateEvent = onDocumentCreate(
  'permissions/{orgID}/documentPermissions/{docID}',
  onDocumentPermissionCreate
);

/** Trigger: when a permission document is deleted. */
export const onPermissionDeleteEvent = onDocumentDelete('permissions/{orgID}', onPermissionDelete);

//--------------------------------
//    Invitations Management    //
//--------------------------------

/** Trigger: when an invitation is created/updated/deleted (e. g. when invitation.status change). */
export const onInvitationWriteEvent = onDocumentWrite('invitations/{invitationID}', onInvitationWrite);

/** Used to check if users have already an invitation to join org existing */
export const hasUserAnOrgOrIsAlreadyInvited = functions().https.onCall(invitations.hasUserAnOrgOrIsAlreadyInvited);

/** Used to get invitation linked to an email when users signup for the first time */
export const getInvitationLinkedToEmail = functions(hotConfig).https.onCall(invitations.getInvitationLinkedToEmail);

/** Used to accept or decline invitation if user is logged in as anonymous */
export const acceptOrDeclineInvitationAsAnonymous = functions().https.onCall(invitations.acceptOrDeclineInvitationAsAnonymous);

//--------------------------------
//    Events Management          //
//--------------------------------

export const onEventCreateEvent = onDocumentCreate('events/{eventId}', onEventCreate);

export const onEventDeleteEvent = onDocumentDelete('events/{eventID}', onEventDelete);

export const requestScreening = functions().https.onCall(skipInMaintenance(logErrors(createScreeningRequest)));

/** Trigger: REST call to invite a list of users by email. */
export const inviteUsers = functions().https.onCall(skipInMaintenance(logErrors(invitations.inviteUsers)));

//--------------------------------
//      Twilio Access           //
//--------------------------------

/** Trigger: REST call to create the access token for connection to twilio */
export const getAccessToken = functions().https.onCall(skipInMaintenance(logErrors(getTwilioAccessToken)));

export const twilioWebhook = functions().https.onRequest(_twilioWebhook);

//--------------------------------
//   Notifications Management   //
//--------------------------------

/**
 * Creates notifications when an event is about to start
 */
export const scheduledNotifications = functions().pubsub.schedule('*/30 * * * *') // every 30 minutes
  .onRun(skipInMaintenance(() => {
    createNotificationsForEventsToStart();
    createNotificationsForFinishedScreenings();
  }));


//--------------------------------
//       Movies Management      //
//--------------------------------

/**
 * Trigger: when a movie is created
 */
export const onMovieCreateEvent = onDocumentCreate('movies/{movieId}', onMovieCreate);

/**
 * Trigger: when a movie is updated
 * movie update can potentially trigger images processing
 */
export const onMovieUpdateEvent = onDocumentUpdate('movies/{movieId}', onMovieUpdate, heavyConfig);

/**
 * Trigger: when a movie is deleted
 */
export const onMovieDeleteEvent = onDocumentDelete('movies/{movieId}', onMovieDelete);

export const requestAskingPrice = functions().https.onCall(skipInMaintenance(logErrors(createAskingPriceRequest)));

export const requestScreener = functions().https.onCall(skipInMaintenance(logErrors(createScreenerRequest)));

//--------------------------------
//     Consents Management      //
//--------------------------------

/**
 * Trigger: when a consent is created
 */
export const createConsent = functions().https.onCall(skipInMaintenance(logErrors(consent.createConsent)));


//--------------------------------
//       Apps Management        //
//--------------------------------

/**
 * Trigger: when a blockframes admin changed an org app access and wants to notify admins.
 */
export const onAccessToAppChanged = functions().https.onCall(skipInMaintenance(accessToAppChanged));


//--------------------------------
//       Emails Management      //
//--------------------------------

/**
 * Trigger: when a blockframes admin wants to send an email.
 */
export const sendMailAsAdmin = functions().https.onCall(skipInMaintenance(_sendMailAsAdmin));

/**
 * Trigger: when a regular user wants to send an email.
 */
export const sendMailWithTemplate = functions().https.onCall(skipInMaintenance(_sendMailWithTemplate));


/** Trigger: when an notification is created to send email if requested */
export const sendNotificationEmails = onDocumentCreate('notifications/{notifID}', onNotificationCreate);

//--------------------------------
//        Offer Management       //
//--------------------------------

export const onOfferCreateEvent = onDocumentCreate('offers/{offerId}', onOfferCreate);
// #7946 this may be reactivated later
// export const onOfferUpdateEvent = onDocumentUpdate('offers/{offerId}', onOfferUpdate); 

//--------------------------------
//       Orgs Management        //
//--------------------------------

/** Trigger: when an organization is created. */
export const onOrganizationCreateEvent = onDocumentCreate('orgs/{orgID}', onOrganizationCreate);

/** 
 * Trigger: when an organization is updated. 
 * org update can potentially trigger images processing
 */
export const onOrganizationUpdateEvent = onDocumentUpdate('orgs/{orgID}', onOrganizationUpdate, heavyConfig);

/** Trigger: when an organization is removed. */
export const onOrganizationDeleteEvent = onDocumentDelete('orgs/{orgID}', onOrganizationDelete);

/** Trigger when an organization ask to access to a new platform  */
export const requestFromOrgToAccessApp = functions().https.onCall(skipInMaintenance(onRequestFromOrgToAccessApp));

//--------------------------------
//      Files management        //
//--------------------------------

export const onFileUpload = projectId === 'demo-blockframes' ?
  functions(heavyConfig).storage.bucket('blockframes-ci').object().onFinalize(skipInMaintenance(linkFile)) :
  functions(heavyConfig).storage.bucket(storageBucket).object().onFinalize(skipInMaintenance(linkFile));

/** Trigger: when an user ask for a private media. */
export const getMediaToken = functions().https.onCall(skipInMaintenance(logErrors(_getMediaToken)));

export const createPdf = functions(heavyConfig).https.onRequest(_createPdf);

export const sendgridEventWebhookListener = functions().https.onRequest(sendgridEventWebhook);

//--------------------------------
//     Contracts Management     //
//--------------------------------

export const onContractDeleteEvent = onDocumentDelete('contracts/{contractId}', onContractDelete);

export const onContractUpdateEvent = onDocumentUpdate('contracts/{contractId}', onContractUpdate);

export const onTermDeleteEvent = onDocumentDelete('terms/{termId}', onTermDelete);

//--------------------------------
//     Negotiation Management     //
//--------------------------------

export const onNegotiationUpdateEvent = onDocumentUpdate('contracts/{contractId}/negotiations/{negotiationId}', onNegotiationUpdate);
export const onNegotiationCreateEvent = onDocumentCreate('contracts/{contractId}/negotiations/{negotiationId}', onNegotiationCreated);

//--------------------------------
//          JWP RESCUE          //
//--------------------------------

export const downloadVideoToStorage = functions(superHeavyConfig).https.onRequest(downloadVideo);

//--------------------------------
//          WATERFALL           //
//--------------------------------

export const buildWaterfall = functions().https.onCall(skipInMaintenance(_buildWaterfall));

/**
 * Trigger: when a waterfall is updated
 */
export const onWaterfallUpdateEvent = onDocumentUpdate('waterfall/{waterfallId}', onWaterfallUpdate);

/**
 * Trigger: when a waterfallDocument is deleted
 */
export const onWaterfallDocumentDeleteEvent = onDocumentCreate('waterfall/{waterfallId}/documents/{document}', onWaterfallDocumentDelete);

/**
 * When user wants to remove a file without removing waterfallDocument
 */
export const deleteWaterfallFile = functions().https.onCall(removeWaterfallFile);
