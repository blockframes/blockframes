import { backupBucket, firebase } from '@env';
import { Writable } from "stream";
import { Queue } from '../queue';
import { DbRecord, loadAdminServices } from '../util';
import type { CollectionReference, QueryDocumentSnapshot, QuerySnapshot } from '../types';
import type { Bucket } from "@google-cloud/storage";
import type { storage } from 'firebase-admin';
import { execSync } from 'child_process';
import { runShellCommandExec } from '../commands';

export async function getBackupOutput(bucket: Bucket, name: string): Promise<Writable> {
  const blob = bucket.file(`${name}.jsonl`);
  return blob.createWriteStream({ resumable: false });
}


export async function getBackupBucket(gcs?: storage.Storage): Promise<Bucket> {
  const bucket: Bucket = (gcs || loadAdminServices().storage).bucket(backupBucket);
  const exists = await bucket.exists();

  // The api returns an array.
  if (!exists[0]) await bucket.create();

  return bucket;
}

export async function exportFirestoreToBucket(db: FirebaseFirestore.Firestore, bucket: Bucket) {
  const now = new Date().toISOString();
  const stream = await getBackupOutput(bucket, now);
  // Note: we use a Queue to store the collections to backup instead of doing a recursion,
  // this will protect the stack. It will break when the size of keys to backup grows
  // larger than our memory quota (memory is around 500mo => around 50GB of firestore data to backup)
  // We'll have to store them in a collection at this point.
  const processingQueue = new Queue();

  // retrieve all the collections at the root.
  const collections: CollectionReference[] = await db.listCollections()
  collections.forEach(x => processingQueue.push(x.path));

  while (!processingQueue.isEmpty()) {
    // Note: we could speed up the code by processing multiple collections at once,
    // we push many promises to a "worker queue" and await them when it reaches a certain size
    // instead of using a while that blocks over every item.
    const currentPath: string = processingQueue.pop();
    const q: QuerySnapshot = await db.collection(currentPath).get();

    if (q.size === 0) {
      // Empty, move on
      continue;
    }

    // Go through each document of the collection for backup
    const promises = q.docs.map(async (doc: QueryDocumentSnapshot) => {
      // Store the data
      const docPath: string = doc.ref.path;
      const content: any = doc.data();
      const stored: DbRecord = { docPath, content };

      stream.write(JSON.stringify(stored));
      stream.write('\n');

      // Adding the current path to the subcollections to backup
      const subCollections = await doc.ref.listCollections();
      subCollections.forEach(x => processingQueue.push(x.path));
    });

    // Wait for this backup to complete
    await Promise.all(promises);
  }
  console.log('Firestore export done, closing our stream');
  return new Promise((res) => {
    stream.end(res);
  });
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
