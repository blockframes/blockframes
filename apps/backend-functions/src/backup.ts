import { Writable } from 'stream';
import * as admin from 'firebase-admin';
import type { Bucket } from '@google-cloud/storage';
import { db, getBackupBucketName } from './internals/firebase';
import {
  JsonlDbRecord,
  restoreFromBackupBucket,
  Queue,
  Firestore,
  CollectionReference,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from '@blockframes/firebase-utils';


const getBackupBucket = async (): Promise<Bucket> => {
  // July 2020: There are conflicts between firebase-admin type & google-cloud/storage. We need to use "as any"
  const bucket: Bucket = admin.storage().bucket(getBackupBucketName()) as any;
  const exists = await bucket.exists();

  // The api returns an array.
  if (!exists[0]) {
    await bucket.create();
  }

  return bucket;
};

const getBackupOutput = async (bucket: Bucket, name: string): Promise<Writable> => {
  const blob = bucket.file(`${name}.jsonl`);
  return blob.createWriteStream({ resumable: false });
};

/**
 * Return all collection in the firestore instance provided, skip the "meta" collection
 * that should not be backup'd or restored.
 * @param firestore
 */
const backupedCollections = async (firestore: Firestore): Promise<CollectionReference[]> => {
  // NOTE: this is legacy code, once upon a time we'd skip the backup of the _restore / _META collection
  // we disabled that, and this function might be useless now.
  return await firestore.listCollections();
};

export async function freeze(req: any, resp: any) {
  // Prep ouput
  const now = new Date().toISOString();
  const bucket: Bucket = await getBackupBucket();
  const stream = await getBackupOutput(bucket, now);

  // Note: we use a Queue to store the collections to backup instead of doing a recursion,
  // this will protect the stack. It will break when the size of keys to backup grows
  // larger than our memory quota (memory is around 500mo => around 50GB of firestore data to backup)
  // We'll have to store them in a collection at this point.
  const processingQueue = new Queue();

  // retrieve all the collections at the root.
  const collections: CollectionReference[] = await backupedCollections(db);
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
      const stored: JsonlDbRecord = { docPath, content };

      stream.write(JSON.stringify(stored));
      stream.write('\n');

      // Adding the current path to the subcollections to backup
      const subCollections = await doc.ref.listCollections();
      subCollections.forEach(x => processingQueue.push(x.path));
    });

    // Wait for this backup to complete
    await Promise.all(promises);
  }

  console.info('Done, closing our stream');
  await new Promise(resolve => {
    stream.end(resolve);
  });

  console.info('Finally');
  return resp.status(200).send('success');
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
