import { clearDb } from './clear';
import { backupBucket, firebase } from '@env';
import { runShellCommandExec } from '../commands';
import { getDb } from '@blockframes/firebase-utils/initialize';

/**
 * This function will run `gcloud` shell command to import Firestore backup from GCS bucket into Firestore.
 * @param dirName remote directory name which to look in, in he GCS backup bucket to find Firestore backup
 */
export async function importFirestoreFromBucket(dirName: string, allowProd = false) {
  const url = `gs://${backupBucket}/${dirName}`;
  const cmd = `gcloud firestore import --project ${firebase().projectId} ${url}`;

  const db = getDb();
  await clearDb(db, allowProd);

  return runShellCommandExec(cmd);
}
