/**
 * Exposes imports and types to access the firebase / firestore / gcloud admin tools.
 *
 * Helper to avoid duplicating all the "semi-broken" google type defs.
 */
import { getLatestDirName, importFirestoreFromBucket, getBackupBucket } from './firebase-utils';

/**
 * This function will import a Firestore export from the local env's
 * GCS bucket. If no directory name provided, then it will detect the
 * latest backup based on date in folder name.
 *
 * @param dirName optional name of bucket dir to import Firestore from
 */
export async function importFirestore(dirName?:string) {
  let dir: string;
  if (dirName) {
    dir = dirName;
  } else {
    const bucket = await getBackupBucket();
    dir = await getLatestDirName(bucket, 'firestore');
  }
  await importFirestoreFromBucket(dir)
}
