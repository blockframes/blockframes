/**
 * Exposes imports and types to access the firebase / firestore / gcloud admin tools.
 *
 * Helper to avoid duplicating all the "semi-broken" google type defs.
 */
import { isInMaintenance, sleep } from '@blockframes/firebase-utils';
import { PubSub } from '@google-cloud/pubsub'
import { firebase } from '@env'

/**
 * Trigger a firestore database restore operation for the given project
 */
export async function restore() {
  const pubsub = new PubSub({ projectId: firebase.projectId });
  await pubsub.topic('firestore').publish(Buffer.from('import'));
  await sleep(5000);
  for (let i = 0; i < 10; i++) {
    const maintenance = await isInMaintenance(120 * 1000); // 2 minutes delay
    if (!maintenance) {
      console.log('Restore process ended!');
      return;
    } else {
      console.log('Waiting for the restore process to end ...');
      await sleep(1000 * 50);
    }
  }
  throw Error('Restore process did not finish within allocated timeframe!');
}

/**
 * Trigger a firestore database backup operation for the given project
 */
export async function backup() {
  const pubsub = new PubSub({ projectId: firebase.projectId });
  await pubsub.topic('firestore').publish(Buffer.from('export'));
}
