import type { Bucket } from '@google-cloud/storage';
import { db } from './internals/firebase';
import { restoreFromBackupBucket, getBackupBucket, exportFirestoreToBucket } from '@blockframes/firebase-utils';

export async function freeze(req: any, resp: any) {
  // Prep output
  const bucket: Bucket = await getBackupBucket();

  try {
    await exportFirestoreToBucket(db, bucket);
    return resp.status(200).send('Firestore export done, closing our stream');
  } catch (e) {
    return resp.status(200).send(`Error: ${(e as Error).message}`);
  }

}

export async function restore(req: any, resp: any) {
  // We get the backup file before clearing the db, just in case.
  const bucket = await getBackupBucket();

  try {
    await restoreFromBackupBucket(bucket, db)
    return resp.status(200).send('success');
  } catch (e) {
    return resp.status(200).send(`Error: ${(e as Error).message}`);
  }

}
