import { exportFirestoreToBucketBeta } from '@blockframes/devops';

/**
 * This function runs `gcloud` shell command to backup live Firestore to the project's backup bucket GCS resource
 * @param dirName optional remote directory name in which to save the Firestore export
 */
export async function exportFirestore(dirName?: string) {
  await exportFirestoreToBucketBeta(dirName);
}
