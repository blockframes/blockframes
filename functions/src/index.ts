// import * as gcs from '@google-cloud/storage';
import { hashToFirestore } from './generateHash';
import { onIpHash } from './ipHash';
import { onDeliveryUpdate, onDeliveryDelete } from './delivery';
import { auth, db, functions } from './firebase';
import { relayerCreateLogic, relayerSendLogic } from './relayer';
import { deleteFirestoreMovie, deleteFirestoreDelivery } from './delete';

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
  .onCreate((user) => {
    const { email, uid } = user;
    return db.collection('users').doc(user.uid).set({ email, uid });
  });

/**
 * Trigger: REST call to find a list of users by email.
 */
export const findUserByMail = functions.https
  .onCall((data, context) => {
    const prefix: string = decodeURIComponent(data.prefix);

    // Leave if the prefix is too short (do not search every users in the universe).
    if (prefix.length < 2) {
      return [];
    }

    // String magic to figure out a prefixEnd
    // Say prefix is 'aaa'. We want to search all strings between 'aaa' (prefix) and 'aab' (prefixEnd)
    // this will match: 'aaa', 'aaaa', 'aaahello', 'aaazerty', etc.
    const incLast: string = String.fromCharCode(prefix.slice(-1).charCodeAt(0) + 1);
    const prefixEnd: string = prefix.slice(0, -1) + incLast;

    return db.collection('users')
      .where('email', '>=', prefix)
      .where('email', '<', prefixEnd)
      .get()
      .then(q => {
        // leave if there are too many results.
        if (q.size > 10) {
          return [];
        }

        return q.docs.map(d => ({ id: d.id, email: d.data().email }));
      });
  });

/**
 * Trigger: REST call to find a list of orgs by name.
 */
export const findOrgByName = functions.https
  .onCall((data, context) => {
    const prefix: string = decodeURIComponent(data.prefix);

    // Leave if the prefix is too short (do not search every users in the universe).
    if (prefix.length < 2) {
      return [];
    }

    // String magic to figure out a prefixEnd
    // Say prefix is 'aaa'. We want to search all strings between 'aaa' (prefix) and 'aab' (prefixEnd)
    // this will match: 'aaa', 'aaaa', 'aaahello', 'aaazerty', etc.
    const incLast: string = String.fromCharCode(prefix.slice(-1).charCodeAt(0) + 1);
    const prefixEnd: string = prefix.slice(0, -1) + incLast;

    return db.collection('orgs')
      .where('name', '>=', prefix)
      .where('name', '<', prefixEnd)
      .get()
      .then(matchingOrgs => {
        // leave if there are too many results.
        if (matchingOrgs.size > 10) {
          return [];
        }

        return matchingOrgs.docs.map(matchingOrg => ({ id: matchingOrg.id, name: matchingOrg.data().name }));
      });
  });
/**
 * Trigger: REST call to get or create a user.
 */
export const getOrCreateUserByMail = functions.https
  .onCall(async (data, context) => {
    const { email } = data;

    try {
      const u = await auth.getUserByEmail(email);
      return { id: u.uid, email };
    } catch {
      const u = await auth.createUser({
        email,
        emailVerified: false,
        disabled: false
      });

      // TODO: trigger API to send a mail.

      return { id: u.uid, email };
    }
  });

/**
 * Trigger: when signature (`orgId`) is added to or removed from `validated[]`
 */
export const onDeliveryUpdateEvent = functions.firestore
  .document('deliveries/{deliveryID}')
  .onUpdate(onDeliveryUpdate);

/**
 * Trigger: when a delivery is deleted
 */
export const onDeliveryDeleteEvent = functions.firestore
  .document('deliveries/{deliveryID}')
  .onDelete(onDeliveryDelete);

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
