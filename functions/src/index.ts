// import * as gcs from '@google-cloud/storage';
import { hashToFirestore } from './generateHash';
import { onIpHash } from './ipHash';
import { onDeliveryUpdate } from './delivery';
import { functions } from './firebase';
import {
  relayerCreateLogic,
  relayerSendLogic,
  relayerRequestTokensLogic,
  relayerSignDeliveryLogic,
  Config,
} from './relayer';
import {
  deleteFirestoreMovie,
  deleteFirestoreDelivery,
} from './delete';
import {
  onDeliveryStakeholderCreate,
  onDeliveryStakeholderDelete,
  onMovieStakeholderCreate,
  onMovieStakeholderDelete,
} from './stakeholder';
import * as users from './users';
import * as backup from './backup';
import { onMaterialUpdate } from './material';


/**
 * Trigger: when eth-events-server pushes contract events.
 */
export const onIpHashEvent = functions.pubsub
  .topic('eth-events.ipHash')
  .onPublish(onIpHash);

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
 * Trigger: when signature (`orgId`) is added to or removed from `validated[]`
 */
export const onDeliveryUpdateEvent = functions.firestore
  .document('deliveries/{deliveryID}')
  .onUpdate(onDeliveryUpdate);

/**
 * Trigger: when material state or step is modified
 */
export const onMaterialUpdateEvent = functions.firestore
  .document('movies/{movieID}/materials/{materialID}')
  .onUpdate(onMaterialUpdate);

/**
 * Trigger: when a stakeholder is added to a delivery
 */
export const onDeliveryStakeholderCreateEvent = functions.firestore
  .document('deliveries/{deliveryID}/stakeholders/{stakeholerID}')
  .onCreate(onDeliveryStakeholderCreate);

/**
 * Trigger: when a stakeholder is removed from a delivery
 */
export const onDeliveryStakeholderDeleteEvent = functions.firestore
  .document('deliveries/{deliveryID}/stakeholders/{stakeholerID}')
  .onDelete(onDeliveryStakeholderDelete);

/**
 * Trigger: when a stakeholder is added to a movie
 */
export const onMovieStakeholderCreateEvent = functions.firestore
  .document('movies/{movieID}/stakeholders/{stakeholerID}')
  .onCreate(onMovieStakeholderCreate);

/**
 * Trigger: when a stakeholder is removed from a movie
 */
export const onMovieStakeholderDeleteEvent = functions.firestore
  .document('movies/{movieID}/stakeholders/{stakeholerID}')
  .onDelete(onMovieStakeholderDelete);

//--------------------------------
//            RELAYER           //
//--------------------------------

export const relayerCreate = functions.https
  .onCall((data, context) => relayerCreateLogic(data, functions.config() as Config));

export const relayerSend = functions.https
  .onCall((data, context) => relayerSendLogic(data, functions.config() as Config));

export const relayerRequestTokens = functions.https
  .onCall((data, context) => relayerRequestTokensLogic(data, functions.config() as Config));

export const relayerSignDelivery = functions.https
  .onCall((data, context) => relayerSignDeliveryLogic(data, functions.config() as Config));

//--------------------------------
//   PROPER FIRESTORE DELETION  //
//--------------------------------

export const deleteMovie = functions.firestore
  .document('movies/{movieId}')
  .onDelete(deleteFirestoreMovie);

export const deleteDelivery = functions.firestore
  .document('deliveries/{deliveryId}')
  .onDelete(deleteFirestoreDelivery);
