import { loadAdminServices } from '@blockframes/firebase-utils';
import { clearDb } from './clear';
import { backupBucket, firebase } from '@env';
import { runShellCommandExec } from '@blockframes/devops';


/**
 * This function will run `gcloud` shell command to import Firestore backup from GCS bucket into Firestore.
 * @param dirName remote directory name which to look in, in he GCS backup bucket to find Firestore backup
 */
export async function importFirestoreFromBucket(dirName: string) {
  const url = `gs://${backupBucket}/${dirName}`;
  const cmd = `gcloud firestore import --project ${firebase().projectId} ${url}`;

  const { db } = loadAdminServices();
  await clearDb(db);

  return runShellCommandExec(cmd)
}
