/**
 * Exposes imports and types to access the firebase / firestore / gcloud admin tools.
 *
 * Helper to avoid duplicating all the "semi-broken" google type defs.
 */
import {
  exportFirestoreToBucket,
  getBackupBucket,
  getLatestDirName,
  importFirestoreFromBucket,
  loadAdminServices,
  restoreFromBackupBucket,
} from '@blockframes/firebase-utils';

/**
 * Trigger a firestore database restore operation for the given project
 * @deprecated
 */
export async function restore(file?: string) {
  const { db, storage } = loadAdminServices();
  return restoreFromBackupBucket(await getBackupBucket(storage), db, file);
}

/**
 * Trigger a firestore database backup operation for the given project
 * @deprecated
 */
export async function backup() {
  const { db, storage } = loadAdminServices();
  return exportFirestoreToBucket(db, await getBackupBucket(storage));
}

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
    dir = await getLatestDirName(bucket);
  }
  await importFirestoreFromBucket(dir)
}
