// import * as gcs from '@google-cloud/storage';
import { hashToFirestore } from './generateHash';
import { onIpHash } from './ipHash';
import { functions } from './firebase';

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
