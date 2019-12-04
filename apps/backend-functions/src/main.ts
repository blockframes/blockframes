// import * as gcs from '@google-cloud/storage';
import { hashToFirestore } from './generateHash';
import { onIpHash } from './ipHash';
import { onDeliveryUpdate } from './delivery';
import { functions } from './internals/firebase';
import {
  RelayerConfig,
  relayerDeployLogic,
  relayerRegisterENSLogic,
  relayerSendLogic,
} from './relayer';
import { mnemonic, relayer } from './environments/environment';
import {
  deleteFirestoreDelivery,
  deleteFirestoreMaterial,
  deleteFirestoreMovie,
  deleteFirestoreTemplate
} from './delete';
import {
  onDeliveryStakeholderCreate,
  onDeliveryStakeholderDelete
} from './stakeholder';
import * as users from './users';
import {
  onDocumentCreate,
  onDocumentDelete,
  onDocumentUpdate,
  onDocumentWrite,
  onOrganizationDocumentUpdate
} from './utils';
import { onGenerateDeliveryPDFRequest } from './internals/pdf';
import { logErrors } from './internals/sentry';
import { onInvitationWrite } from './invitation';
import { onOrganizationCreate, onOrganizationDelete, onOrganizationUpdate } from './orgs';
import { adminApp, onRequestAccessToAppWrite } from './admin';

/** Trigger: when eth-events-server pushes contract events. */
export const onIpHashEvent = functions.pubsub.topic('eth-events.ipHash').onPublish(onIpHash);

/**
 * Trigger: when user uploads document to firestore.
 *
 * NOTE: we will need to refactor the function to dispatch
 * depending on the file path. Or use different storage buckets
 * (one per app maybe).
 */
export const generateHash = functions.storage
  .object()
  .onFinalize(hashToFirestore);

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

/** Trigger: REST call to find a list of organizations by name. */
export const findOrgByName = functions.https
  .onCall(logErrors(users.findOrgByName));

/** Trigger: REST call to get or create a user. */
export const getOrCreateUserByMail = functions.https.onCall(logErrors(users.getOrCreateUserByMail));

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
export const admin = functions.https
  .onRequest(adminApp);

/** Trigger: when signature (`orgId`) is added to or removed from `validated[]`. */
export const onDeliveryUpdateEvent = onDocumentUpdate('deliveries/{deliveryID}', onDeliveryUpdate);

/** Trigger: when a stakeholder is added to a delivery. */
export const onDeliveryStakeholderCreateEvent = onDocumentCreate(
  'deliveries/{deliveryID}/stakeholders/{stakeholerID}',
  onDeliveryStakeholderCreate
);

/** Trigger: when a stakeholder is removed from a delivery. */
export const onDeliveryStakeholderDeleteEvent = onDocumentDelete(
  'deliveries/{deliveryID}/stakeholders/{stakeholerID}',
  onDeliveryStakeholderDelete
);

/** Trigger: when an invitation is updated (e. g. when invitation.status change). */
export const onInvitationUpdateEvent = onDocumentWrite(
  'invitations/{invitationID}',
  onInvitationWrite
);

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
//        GENERATE PDF          //
//--------------------------------

/** Trigger: REST call to generate a delivery PDF. */
export const generateDeliveryPDF = functions.https.onRequest(logErrors(onGenerateDeliveryPDFRequest));


//--------------------------------
//            RELAYER           //
//--------------------------------
const RELAYER_CONFIG: RelayerConfig = {
  ...relayer,
  mnemonic
};

export const relayerDeploy = functions.runWith({timeoutSeconds: 540}).https
  .onCall((data, context) => logErrors(relayerDeployLogic(data, RELAYER_CONFIG)));

export const relayerRegister = functions.runWith({timeoutSeconds: 540}).https
  .onCall((data, context) => logErrors(relayerRegisterENSLogic(data, RELAYER_CONFIG)));

export const relayerSend = functions.https
  .onCall((data, context) => logErrors(relayerSendLogic(data, RELAYER_CONFIG)));

//--------------------------------
//   PROPER FIRESTORE DELETION  //
//--------------------------------

export const deleteMovie = onDocumentDelete('movies/{movieId}', logErrors(deleteFirestoreMovie));

export const deleteDelivery = onDocumentDelete('deliveries/{deliveryId}', logErrors(deleteFirestoreDelivery));

export const deleteMaterial = onDocumentDelete('deliveries/{deliveryId}/materials/{materialId}', logErrors(deleteFirestoreMaterial));

export const deleteTemplate = onDocumentDelete('templates/{templateId}', logErrors(deleteFirestoreTemplate));
