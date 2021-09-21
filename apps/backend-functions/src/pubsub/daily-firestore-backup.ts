import { db, storage } from '../internals/firebase'
import { exportFirestoreToBucket, getBackupBucket } from '@blockframes/firebase-utils';
import { enableDailyFirestoreBackup } from '../environments/environment'
import type { Bucket } from '@google-cloud/storage';
import { heavyFunctions } from '../internals/functions/heavyConfig';

async function dailyBackupHandler() {
  const bucket: Bucket = await getBackupBucket(storage);
  if (enableDailyFirestoreBackup) return exportFirestoreToBucket(db, bucket);

  const msg = 'Daily backup skipped due to non-production environment';
  console.log(msg)
  return Promise.resolve(msg)
}

export const dailyFirestoreBackup = heavyFunctions.pubsub.schedule('0 1 * * *').onRun(dailyBackupHandler)
