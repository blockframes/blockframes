import { db, functions } from '../internals/firebase'
import { exportFirestoreToBucket, getBackupBucket } from '@blockframes/firebase-utils';
import { Bucket } from '@google-cloud/storage';
import { enableDailyFirestoreBackup } from '../environments/environment'
import { heavyConfig } from '../main';

async function dailyBackupHandler() {
  const bucket: Bucket = await getBackupBucket();
  if (enableDailyFirestoreBackup) return exportFirestoreToBucket(db, bucket);

  const msg = 'Daily backup skipped due to non-production environment';
  console.log(msg)
  return Promise.resolve(msg)
}

export const dailyFirestoreBackup = functions.runWith(heavyConfig).pubsub.schedule('0 1 * * *').onRun(dailyBackupHandler)
