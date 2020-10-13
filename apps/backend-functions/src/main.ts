import { functions } from './internals/firebase';
import * as users from './users';
import * as invitations from './invitation';
import {
  onDocumentCreate,
  onDocumentDelete,
  onDocumentWrite,
} from './utils';
import { logErrors } from './internals/sentry';
import { onInvitationWrite } from './invitation';
import { onOrganizationCreate, onOrganizationDelete, onOrganizationUpdate, accessToAppChanged } from './orgs';
import { adminApp } from './admin';
import { onMovieUpdate, onMovieCreate, onMovieDelete } from './movie';
import * as bigQuery from './bigQuery';
import { onDocumentPermissionCreate } from './permissions';
import { onContractWrite } from './contract';
import { createNotificationsForEventsToStart } from './internals/invitations/events';
import { getPrivateVideoUrl } from './player';
import { sendTestMail } from './internals/email';
import { linkFile, getMediaToken as _getMediaToken } from './media';
import { onEventDelete } from './event';
import { skipInMaintenance } from '@blockframes/firebase-utils';
import { RuntimeOptions } from 'firebase-functions';

import * as twilio from './twilio';



//--------------------------------
//    Configuration             //
//--------------------------------

/**
 * Runtime options for heavy functions
 * @dev linked to #2531 (Changing functions REGION)
 */
const heavyConfig: RuntimeOptions = {
  timeoutSeconds: 300,
  memory: '1GB',
};


//--------------------------------
//    Users Management          //
//--------------------------------

/** Trigger: REST call to invite a list of users by email. */
export const createUser = functions.https.onCall(logErrors(users.createUser));

/**
 * Trigger: when user creates an account.
 *
 * We create a corresponding document in `users/userID`.
 */
export const onUserCreate = functions.auth
  .user()
  .onCreate(logErrors(users.onUserCreate));

export const onUserCreateDocument = onDocumentCreate(
  '/users/{userID}',
  users.onUserCreateDocument
);

export const onUserUpdate = functions
  .runWith(heavyConfig) // user update can potentially trigger images processing
  .firestore.document('/users/{userID}')
  .onUpdate(skipInMaintenance(users.onUserUpdate));


export const onUserDelete = onDocumentDelete(
  '/users/{userID}',
  users.onUserDelete
);

/** Trigger: REST call to send a verify email to a user. */
// @TODO (#2821)
/*export const sendVerifyEmail = functions.https
  .onCall(users.startVerifyEmailFlow);*/

/** Trigger: REST call to send a reset password link to a user. */
export const sendResetPasswordEmail = functions.https
  .onCall(users.startResetPasswordEmail);

//--------------------------------
//        Misc Management       //
//--------------------------------

/** Trigger: REST call when an user contacts blockframes admin and send them an email. */
export const sendUserContactMail = functions.https.onCall(logErrors(users.sendUserMail));

/** Trigger: REST call to send a mail to an admin for demo request. */
export const sendDemoRequest = functions.https.onCall(logErrors(users.sendDemoRequest));

/** Trigger: REST call bigQuery with an array of movieIds to get their analytics. */
export const getMovieAnalytics = functions.https.onCall(logErrors(bigQuery.requestMovieAnalytics));

/** Trigger: REST call bigQuery with an array of eventIds to get their analytics. */
export const getEventAnalytics = functions.https.onCall(logErrors(bigQuery.requestEventAnalytics));

/** Trigger: REST call bigQuery to fetch analytics active users */
export const getAnalyticsActiveUsers = functions.https.onCall(logErrors(bigQuery.getAnalyticsActiveUsers));

//--------------------------------
//      Player  Management      //
//--------------------------------

export const privateVideo = functions.https.onCall(logErrors(getPrivateVideoUrl));

/**
 * Trigger: REST call to the /admin app
 *
 *  - Backups / Restore the database
 *  - Quorum Deploy & setup a movie smart-contract
 */
export const admin = functions.runWith(heavyConfig).https.onRequest(adminApp);

//--------------------------------
//   Permissions  Management    //
//--------------------------------

/** Trigger: when a permission document is created. */
export const onDocumentPermissionCreateEvent = onDocumentCreate(
  'permissions/{orgID}/documentPermissions/{docID}',
  onDocumentPermissionCreate
);

/** Trigger: when an user ask for a private media. */
export const getMediaToken = functions.https.onCall(logErrors(_getMediaToken));

//--------------------------------
//    Invitations Management    //
//--------------------------------

/** Trigger: when an invitation is updated (e. g. when invitation.status change). */
export const onInvitationUpdateEvent = onDocumentWrite(
  'invitations/{invitationID}',
  onInvitationWrite
);

//--------------------------------
//    Events Management          //
//--------------------------------

export const onEventDeleteEvent = onDocumentDelete(
  'events/{eventID}',
  logErrors(onEventDelete)
);

/** Trigger: REST call to invite a list of users by email. */
export const inviteUsers = functions.https.onCall(logErrors(invitations.inviteUsers));

//--------------------------------
//      Twilio Access           //
//--------------------------------

/** Trigger: REST call to create the access token for connection to twilio */
export const getTwilioAccessToken = functions.https.onCall(logErrors(twilio.getTwilioAccessToken));


//--------------------------------
//   Notifications Management   //
//--------------------------------

/**
 * Creates notifications when an event is about to start
 */
export const scheduledNotifications = functions.pubsub.schedule('0 4 * * *')// every day at 4 AM
  .onRun(_ => createNotificationsForEventsToStart());

//--------------------------------
//       Movies Management      //
//--------------------------------

/**
 * Trigger: when a movie is created
 */
export const onMovieCreateEvent = onDocumentCreate(
  'movies/{movieId}',
  onMovieCreate
);

/**
 * Trigger: when a movie is updated
 */
export const onMovieUpdateEvent = functions
  .runWith(heavyConfig) // movie update can potentially trigger images processing
  .firestore.document('movies/{movieId}')
  .onUpdate(skipInMaintenance(onMovieUpdate));

/**
 * Trigger: when a movie is deleted
 */
export const onMovieDeleteEvent = onDocumentDelete(
  'movies/{movieId}',
  logErrors(onMovieDelete)
)

//------------------------------------------------
//   Contracts & Contracts Version Management   //
//------------------------------------------------

/**
 * Trigger: when a contract is created/updated/deleted
 */
export const onContractWriteEvent = onDocumentWrite(
  'contracts/{contractId}',
  onContractWrite
);

//--------------------------------
//       Apps Management        //
//--------------------------------

/**
 * Trigger: when a blockframes admin changed an org app access and wants to notify admins.
 */
export const onAccessToAppChanged = functions.https.onCall(accessToAppChanged);


//--------------------------------
//       Emails Management      //
//--------------------------------

/**
 * Trigger: when a blockframes admin wants to send an email.
 */
export const onSendTestMail = functions.https.onCall(sendTestMail);

//--------------------------------
//       Orgs Management        //
//--------------------------------

/** Trigger: when an organization is created. */
export const onOrganizationCreateEvent = onDocumentCreate(
  'orgs/{orgID}',
  onOrganizationCreate
);

/** Trigger: when an organization is updated. */
export const onOrganizationUpdateEvent = functions
  .runWith(heavyConfig) // org update can potentially trigger images processing
  .firestore.document('orgs/{orgID}')
  .onUpdate(skipInMaintenance(logErrors(onOrganizationUpdate)));

/** Trigger: when an organization is removed. */
export const onOrganizationDeleteEvent = onDocumentDelete(
  'orgs/{orgID}',
  onOrganizationDelete
);

//--------------------------------
//      Files management        //
//--------------------------------

export const onFileUpload = functions.storage.object().onFinalize(skipInMaintenance(linkFile));
