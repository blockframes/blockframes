/**
 * Exposes imports and types to access the firebase / firestore / gcloud admin tools.
 *
 * Helper to avoid duplicating all the "semi-broken" google type defs.
 */
import { importComplete, loadAdminServices, sleep } from '@blockframes/firebase-utils';
import { PubSub } from '@google-cloud/pubsub';
import { firebase } from '@env';

/**
 * Trigger a firestore database restore operation for the given project
 */
export async function restore(file?: string) {
  const { db } = loadAdminServices();
  const pubsub = new PubSub({ projectId: firebase.projectId });
  await pubsub.topic('firestore').publish(Buffer.from('import'), { ...file && { file } });
  await sleep(5000); // Wait for process to start
  const timeoutPromise = () => sleep(1000 * 60 * 10).then(() => 'timeout');
  const result = await Promise.race([timeoutPromise(), importComplete(db)]);
  if (result === 'timeout') {
    throw Error('TIMEOUT: Restore process did not finish within allocated timeframe!');
  } else {
    console.log('Firestore import completed successfully!');
  }
}

/**
 * Trigger a firestore database backup operation for the given project
 */
export async function backup() {
  loadAdminServices();
  const pubsub = new PubSub({ projectId: firebase.projectId });
  await pubsub.topic('firestore').publish(Buffer.from('export'));
  console.log('Firestore backup successfully requested.');
}
