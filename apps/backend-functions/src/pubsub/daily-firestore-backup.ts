import { db, functions, storage } from '../internals/firebase'
import { exportFirestoreToBucket, getBackupBucket, heavyConfig } from '@blockframes/firebase-utils';
import { enableDailyFirestoreBackup } from '../environments/environment'
import type { Bucket } from '@google-cloud/storage';

async function dailyBackupHandler() {
  const bucket: Bucket = await getBackupBucket(storage);
  if (enableDailyFirestoreBackup) return exportFirestoreToBucket(db, bucket);

  const msg = 'Daily backup skipped due to non-production environment';
  console.log(msg)
  return Promise.resolve(msg)
}

export const dailyFirestoreBackup = functions(heavyConfig).pubsub.schedule('0 1 * * *').onRun(dailyBackupHandler)
