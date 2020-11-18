/**
 * Exposes imports and types to access the firebase / firestore / gcloud admin tools.
 *
 * Helper to avoid duplicating all the "semi-broken" google type defs.
 */
import { exportFirestoreToBucket, getBackupBucket, loadAdminServices, restoreFromBackupBucket } from '@blockframes/firebase-utils';

/**
 * Trigger a firestore database restore operation for the given project
 */
export async function restore(file?: string) {
  const { db } = loadAdminServices();
  await restoreFromBackupBucket(await getBackupBucket(), db, file);
}

/**
 * Trigger a firestore database backup operation for the given project
 */
export async function backup() {
  const { db } = loadAdminServices();
  exportFirestoreToBucket(db, await getBackupBucket());
}
