// import * as gcs from '@google-cloud/storage';
import { hashToFirestore } from './generateHash';
import { onIpHash } from './ipHash';
import { onDeliveryUpdate } from './delivery';
import { functions } from './firebase';
import { relayerCreateLogic, relayerSendLogic } from './relayer';
import { deleteFirestoreMovie, deleteFirestoreDelivery } from './delete';
import * as users from './users';
import * as backup from './backup';

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

//--------------------------------
//            RELAYER           //
//--------------------------------

export const relayerCreate = functions.https.onCall((data, context) => relayerCreateLogic(data, functions.config()));
export const relayerSend = functions.https.onCall((data, context) => relayerSendLogic(data, functions.config()));

//--------------------------------
//   PROPER FIRESTORE DELETION  //
//--------------------------------

export const deleteMovie = functions.firestore.document('movies/{movieId}').onDelete((snap, context) => deleteFirestoreMovie(snap, context));
export const deleteDelivery = functions.firestore.document('deliveries/{deliveryId}').onDelete((snap, context) => deleteFirestoreDelivery(snap, context));
