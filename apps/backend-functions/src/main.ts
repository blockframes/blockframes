// import * as gcs from '@google-cloud/storage';
import { functions } from './internals/firebase';
import {
  RelayerConfig,
  relayerDeployLogic,
  relayerRegisterENSLogic,
  relayerSendLogic,
} from './relayer';
import { mnemonic, relayer } from './environments/environment';
import * as users from './users';
import {
  onDocumentCreate,
  onDocumentDelete,
  onDocumentUpdate,
  onDocumentWrite,
  onOrganizationDocumentUpdate
} from './utils';
import { logErrors } from './internals/sentry';
import { onInvitationWrite } from './invitation';
import { onOrganizationCreate, onOrganizationDelete, onOrganizationUpdate } from './orgs';
import { adminApp, onRequestAccessToAppWrite } from './admin';
import { onMovieUpdate, onMovieCreate, onMovieDelete } from './movie';
import * as bigQuery from './bigQuery';
import { onDocumentPermissionCreate } from './permissions';
import { onContractWrite } from './contract';
import * as privateConfig from './privateConfig';

/**
 * Trigger: when user creates an account.
 *
 * We create a corresponding document in `users/userID`.
 */
export const onUserCreate = functions.auth
  .user()
  .onCreate(logErrors(users.onUserCreate));

/** Trigger: REST call to find a list of users by email. */
export const findUserByMail = functions.https
  .onCall(logErrors(users.findUserByMail));

/** Trigger: REST call to send a verify email to a user. */
export const sendVerifyEmail = functions.https
  .onCall(users.startVerifyEmailFlow);

/** Trigger: REST call to send a reset password link to a user. */
export const sendResetPasswordEmail = functions.https
  .onCall(users.startResetPasswordEmailFlow);

/** Trigger: REST call to send a wishlist pending email to a user & a wishlist request to cascade8 admin. */
export const sendWishlistEmails = functions.https
  .onCall(users.startWishlistEmailsFlow);

  /** Trigger: REST call when an user contacts blockframes admin and send them an email. */
export const sendUserContactMail = functions.https.onCall(logErrors(users.sendUserMail));

/** Trigger: REST call to find a list of organizations by name. */
export const findOrgByName = functions.https
  .onCall(logErrors(users.findOrgByName));

/** Trigger: REST call to get or create a user. */
export const getOrCreateUserByMail = functions.https.onCall(logErrors(users.getOrCreateUserByMail));

/** Trigger: REST call to send a mail to an admin for demo request. */
export const sendDemoRequest = functions.https.onCall(logErrors(users.sendDemoRequest));

/** Trigger: REST call bigQuery with a movieId to get its analytics. */
export const getMovieAnalytics = functions.https.onCall(logErrors(bigQuery.requestMovieAnalytics));

/**
 * Trigger: REST call to the /admin app
 *
 * - Let admin accept organizations:
 *    When organizations are created they are in status "pending",
 *    cascade8 admins will accept the organization with this function.
 * - Let admin give an organization access to applications:
 *    Organization cannot access applications until they requested it and
 *    a cascade8 administrator accept their request.
 */
export const admin = functions.https.onRequest(adminApp);

/** Trigger: when an invitation is updated (e. g. when invitation.status change). */
export const onInvitationUpdateEvent = onDocumentWrite(
  'invitations/{invitationID}',
  onInvitationWrite
);

/** Trigger: when a permission document is created. */
export const onDocumentPermissionCreateEvent = onDocumentCreate(
  'permissions/{orgID}/documentPermissions/{docId}',
  onDocumentPermissionCreate
);

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
export const onMovieUpdateEvent = onDocumentUpdate(
  'movies/{movieId}',
  onMovieUpdate
)

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

//---------------------------------
//  Private documents Management //
//---------------------------------

export const setDocumentPrivateConfig = functions.https.onCall(logErrors(privateConfig.setDocumentPrivateConfig));
export const getDocumentPrivateConfig = functions.https.onCall(logErrors(privateConfig.getDocumentPrivateConfig));
// @TODO (#2460)  Waiting for a decision on screening flow before uncomment
//export const setEventUrl = functions.https.onCall(logErrors(privateConfig.setEventUrl));
//export const getEventUrl = functions.https.onCall(logErrors(privateConfig.getEventUrl));

//--------------------------------
//       Apps Management        //
//--------------------------------

/** Trigger: when an organization requests access to apps. */
export const onAccessToApp = onDocumentWrite(
  'app-requests/{orgId}',
  onRequestAccessToAppWrite
);

//--------------------------------
//       Orgs Management        //
//--------------------------------

/** Trigger: when an organization is created. */
export const onOrganizationCreateEvent = onDocumentCreate(
  'orgs/{orgID}',
  onOrganizationCreate
);

/** Trigger: when an organization is updated. */
export const onOrganizationUpdateEvent = onOrganizationDocumentUpdate( // using `onOrganizationDocumentUpdate` instead of `onDocument` for an increase timout of 540s
  'orgs/{orgID}',
  onOrganizationUpdate
);

/** Trigger: when an organization is removed. */
export const onOrganizationDeleteEvent = onDocumentDelete(
  'orgs/{orgID}',
  onOrganizationDelete
);

//--------------------------------
//            RELAYER           //
//--------------------------------
const RELAYER_CONFIG: RelayerConfig = {
  ...relayer,
  mnemonic
};

export const relayerDeploy = functions.runWith({ timeoutSeconds: 540 }).https
  .onCall((data, context) => logErrors(relayerDeployLogic(data, RELAYER_CONFIG)));

export const relayerRegister = functions.runWith({ timeoutSeconds: 540 }).https
  .onCall((data, context) => logErrors(relayerRegisterENSLogic(data, RELAYER_CONFIG)));

export const relayerSend = functions.https
  .onCall((data, context) => logErrors(relayerSendLogic(data, RELAYER_CONFIG)));
