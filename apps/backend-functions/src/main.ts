// import * as gcs from '@google-cloud/storage';
import { hashToFirestore } from './generateHash';
import { onIpHash } from './ipHash';
import { onDeliveryUpdate } from './delivery';
import { functions } from './firebase';
import {
  RelayerConfig,
  relayerCreateLogic,
  relayerRequestTokensLogic,
  relayerSendLogic,
  relayerSignDeliveryLogic
} from './relayer';
import {
  deleteFirestoreDelivery,
  deleteFirestoreMaterial,
  deleteFirestoreMovie,
  deleteFirestoreTemplate
} from './delete';
import {
  onDeliveryStakeholderCreate,
  onDeliveryStakeholderDelete,
  onMovieStakeholderCreate,
  onMovieStakeholderDelete
} from './stakeholder';
import * as users from './users';
import * as backup from './backup';
import * as migrations from './migrations';
import { onDocumentCreate, onDocumentDelete, onDocumentUpdate } from './utils';
import { mnemonic, relayer } from './environments/environment';
import { onGenerateDeliveryPDFRequest } from './pdf';

/**
 * Trigger: when eth-events-server pushes contract events.
 */
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
  .onCreate(users.onUserCreate);

/**
 * Trigger: REST call to find a list of users by email.
 */
export const findUserByMail = functions.https
  .onCall(users.findUserByMail);

/**
 * Trigger: REST call to find a list of orgs by name.
 */
export const findOrgByName = functions.https
  .onCall(users.findOrgByName);

/**
 * Trigger: REST call to get or create a user.
 */
export const getOrCreateUserByMail = functions.https
  .onCall(users.getOrCreateUserByMail);

/**
 * Trigger: REST call to backup firestore
 */
export const backupFirestore = functions.https
  .onRequest(backup.freeze);

/**
 * Trigger: REST call to restore firestore
 */
export const restoreFirestore = functions.https
  .onRequest(backup.restore);

/**
 * Trigger: REST call to migrate the database to V2
 */
export const updateToV2 = functions.https
  .onRequest(migrations.updateToV2);

/**
 * Trigger: when signature (`orgId`) is added to or removed from `validated[]`
 */
export const onDeliveryUpdateEvent = onDocumentUpdate('deliveries/{deliveryID}', onDeliveryUpdate);

/**
 * Trigger: when a stakeholder is added to a delivery
 */
export const onDeliveryStakeholderCreateEvent = onDocumentCreate(
  'deliveries/{deliveryID}/stakeholders/{stakeholerID}',
  onDeliveryStakeholderCreate
);

/**
 * Trigger: when a stakeholder is removed from a delivery
 */
export const onDeliveryStakeholderDeleteEvent = onDocumentDelete(
  'deliveries/{deliveryID}/stakeholders/{stakeholerID}',
  onDeliveryStakeholderDelete
);

/**
 * Trigger: when a stakeholder is added to a movie
 */
export const onMovieStakeholderCreateEvent = onDocumentCreate(
  'movies/{movieID}/stakeholders/{stakeholerID}',
  onMovieStakeholderCreate
);

/**
 * Trigger: REST call to generate a delivery PDF
 */
export const generateDeliveryPDF = functions.https.onRequest(onGenerateDeliveryPDFRequest);

/**
 * Trigger: when a stakeholder is removed from a movie
 */
export const onMovieStakeholderDeleteEvent = onDocumentDelete(
  'movies/{movieID}/stakeholders/{stakeholerID}',
  onMovieStakeholderDelete
);

//--------------------------------
//            RELAYER           //
//--------------------------------

const RELAYER_CONFIG: RelayerConfig = {
  ...relayer,
  mnemonic
};

export const relayerCreate = functions.https
  .onCall((data, context) => relayerCreateLogic(data, RELAYER_CONFIG));

export const relayerSend = functions.https
  .onCall((data, context) => relayerSendLogic(data, RELAYER_CONFIG));

export const relayerRequestTokens = functions.https
  .onCall((data, context) => relayerRequestTokensLogic(data, RELAYER_CONFIG));

export const relayerSignDelivery = functions.https
  .onCall((data, context) => relayerSignDeliveryLogic(data, RELAYER_CONFIG));

//--------------------------------
//   PROPER FIRESTORE DELETION  //
//--------------------------------

export const deleteMovie = onDocumentDelete('movies/{movieId}', deleteFirestoreMovie);

export const deleteDelivery = onDocumentDelete('deliveries/{deliveryId}', deleteFirestoreDelivery);

export const deleteMaterial = onDocumentDelete('deliveries/{deliveryId}/materials/{materialId}', deleteFirestoreMaterial);

export const deleteTemplate = onDocumentDelete('templates/{templateId}', deleteFirestoreTemplate);
