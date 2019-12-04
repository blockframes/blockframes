import { isArray, isEqual, isPlainObject, sortBy } from 'lodash';
import readline from 'readline';
import { Writable } from 'stream';
import * as admin from 'firebase-admin';
import { Bucket, File as GFile } from '@google-cloud/storage';
import { db, getBackupBucketName } from './internals/firebase';

type Firestore = admin.firestore.Firestore;
type CollectionReference = admin.firestore.CollectionReference;
type QuerySnapshot = admin.firestore.QuerySnapshot;
type QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot;
type DocumentReference = admin.firestore.DocumentReference;

const THIRTY_SECONDS_IN_MS = 30 * 1000;

interface StoredDocument {
  docPath: string;
  content: any;
}

class Queue {
  content: string[] = [];

  push(x: string) {
    this.content.push(x);
  }

  pop(): string {
    const x = this.content.shift();

    if (x === undefined) {
      throw new Error('popping from an empty queue');
    } else {
      return x;
    }
  }

  isEmpty(): boolean {
    return this.content.length === 0;
  }
}

const KEYS_TIMESTAMP = sortBy(['_seconds', '_nanoseconds']);

const getBackupBucket = async (): Promise<Bucket> => {
  const bucket: Bucket = admin.storage().bucket(getBackupBucketName());
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
 *
 * @param firestore
 */
const backupedCollections = async (firestore: Firestore): Promise<CollectionReference[]> => {
  // NOTE: this is legacy code, once upon a time we'd skip the backup of the _restore / _META collection
  // we disabled that, and this function might be useless now.
  return await firestore.listCollections();
};

export const freeze = async (req: any, resp: any) => {
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
      const stored: StoredDocument = { docPath, content };

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
};

const clear = async () => {
  const processingQueue = new Queue();

  // Note: this code is heavily inspired by the backup function,
  // TODO: implement a generalized way to go through all docs & collections
  // and use it in both functions.

  // retrieve all the collections at the root.
  const collections: CollectionReference[] = await backupedCollections(db);
  collections.forEach(x => processingQueue.push(x.path));

  while (!processingQueue.isEmpty()) {
    const currentPath: string = processingQueue.pop();
    const docs: DocumentReference[] = await db.collection(currentPath).listDocuments();

    // keep all docs subcollection to be deleted to,
    // delete every doc content.
    const promises = docs.map(async doc => {
      // Adding the current path to the subcollections to backup
      const subCollections = await doc.listCollections();
      subCollections.forEach(x => processingQueue.push(x.path));

      // Delete the document
      return doc.delete();
    });

    await Promise.all(promises);
  }

  return true;
};

/**
 * Take a json object and re-encode its content to match our firebase storage.
 *
 * For example: transform {_second, _nanoseconds} objects back to firestore timestamps
 * objects.
 *
 * @param x the object to reencode
 * @returns a new object
 */
function reEncodeObject(x: any): any {
  if (isArray(x)) {
    // array: recursive descent for each item (used in steps object for example)
    return x.map(reEncodeObject);
  } else if (isPlainObject(x)) {
    const keys = Object.keys(x);

    if (isEqual(sortBy(keys), KEYS_TIMESTAMP)) {
      // We have a timestamp object, re-encode
      return new admin.firestore.Timestamp(x._seconds, x._nanoseconds);
    } else {
      // else: recursive descent
      const r: any = {};
      keys.forEach(k => {
        r[k] = reEncodeObject(x[k]);
      });
      return r;
    }
  } else {
    return x;
  }
}

/**
 * Set the restore timestamp to now.
 */
export const setRestoreFlag = async () => {
  return db
    .collection('_META')
    .doc('_RESTORE')
    .set({ restoredAt: admin.firestore.FieldValue.serverTimestamp() });
};

const isRestoring = async () => {
  const docRestoreMeta = await db
    .collection('_META')
    .doc('_RESTORE')
    .get();
  if (docRestoreMeta.exists && docRestoreMeta.data() && docRestoreMeta.data()!.restoredAt) {
    // @ts-ignore: within this block, we know .data() and `restoredAt' are set
    const { restoredAt } = docRestoreMeta.data();

    const now = admin.firestore.Timestamp.now();

    // If we started the restoration less than twenty seconds ago, we are still in the restore process,
    return restoredAt.toMillis() + THIRTY_SECONDS_IN_MS > now.toMillis();
  }
  return false;
};

// TODO: take the time to fix the types,
// probably turn this into a generic (f: T) to and preserve types.
export const skipWhenRestoring = (f: any) => {
  // return a new function that is:
  // the old function + a check that early exits when we are restoring.
  return async (...args: any[]) => {
    // early exit
    if (await isRestoring()) {
      return true;
    }

    return f(...args);
  };
};

export const restore = async (req: any, resp: any) => {
  // We get the backup file before clearing the db, just in case.
  const bucket = await getBackupBucket();
  const files: GFile[] = (await bucket.getFiles())[0];
  const sortedFiles: GFile[] = sortBy(files, ['name']);

  if (sortedFiles.length === 0) {
    console.info('nothing to restore, leaving');
    return resp.status(200).send('nothing-to-restore');
  }

  const lastFile: GFile = sortedFiles[sortedFiles.length - 1];

  console.info('Updating restore flag');
  await setRestoreFlag();

  console.info('Clearing the database');
  await clear();

  console.info('restoring file:', lastFile.name);
  const stream = lastFile.createReadStream();
  const lineReader = readline.createInterface({
    input: stream,
    terminal: false
  });

  const promises: Promise<any>[] = [];

  const readerDone = new Promise(resolve => {
    lineReader.on('close', resolve);
  });

  stream.on('end', () => {
    lineReader.close();
  });

  // TODO: make this part scalable too, we're going to load the file
  // and create promises "as fast as possible", we should backpressure the
  // callback somehow to make sure the X previous promises have been completed
  // before adding more. This will protect us from memory overflow (similar
  // to the note in the backup code).
  lineReader.on('line', line => {
    const stored: StoredDocument = JSON.parse(line);
    promises.push(db.doc(stored.docPath).set(reEncodeObject(stored.content)));
  });

  promises.push(readerDone);
  await Promise.all(promises);

  await setRestoreFlag();

  console.info(`Done processing: ${promises.length - 1} lines loaded`);
  return resp.status(200).send('success');
};
