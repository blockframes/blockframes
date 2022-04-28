import { backupBucket, firebase } from '@env';
import { loadAdminServices } from '../util';
import type { Bucket } from "@google-cloud/storage";
import type { storage } from 'firebase-admin';
import { runShellCommandExec } from '@blockframes/devops';

export async function getBackupBucket(gcs?: storage.Storage): Promise<Bucket> {
  const bucket: Bucket = (gcs || loadAdminServices().storage).bucket(backupBucket);
  const exists = await bucket.exists();

  // The api returns an array.
  if (!exists[0]) await bucket.create();

  return bucket;
}

/**
 * This function runs `gcloud` shell command to export a Firestore backup into your projects backup GCS bucket
 *
 * @param dirName optional directory to which to export Firestore backup in GCS bucket, otherwise current date will be used
 * with directory naming convention to generate dirName
 */
export function exportFirestoreToBucketBeta(dirName?: string) {
  const suffix = dirName || getFirestoreExportDirname(new Date());
  const url = `gs://${backupBucket}/${suffix}`;
  const cmd = `gcloud firestore export --project ${firebase().projectId} ${url}`;
  return runShellCommandExec(cmd)
}

/**
 * This functino will generate conventional directory name for a Firestore backup given a date
 * @param d `Date` object
 */
export const getFirestoreExportDirname = (d: Date) => `firestore-backup-${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`
