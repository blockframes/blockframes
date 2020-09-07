import { isArray, isEqual, isPlainObject, sortBy } from 'lodash';
import readline from 'readline';
import { Writable } from 'stream';
import * as admin from 'firebase-admin';
import type { Bucket, File as GFile } from '@google-cloud/storage';
import { db, getBackupBucketName } from './internals/firebase';
import { endMaintenance, META_COLLECTION_NAME, startMaintenance, runChunks } from '@blockframes/firebase-utils';

type Firestore = admin.firestore.Firestore;
type CollectionReference = admin.firestore.CollectionReference;
type QuerySnapshot = admin.firestore.QuerySnapshot;
type QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot;
type DocumentReference = admin.firestore.DocumentReference;

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

/**
 * Return all collection in the firestore instance provided, skip the collections
 * that should not be clear'd.
 * @param firestore
 */
const clearedCollection = async (firestore: Firestore): Promise<CollectionReference[]> => {
  // NOTE: this is legacy code, once upon a time we'd skip the backup of the _restore / _META collection
  // we disabled that, and this function might be useless now.
  return (await firestore.listCollections()).filter(x => x.id !== META_COLLECTION_NAME);
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
  // @TODO (#3512) & implement a generalized way to go through all docs & collections
  // and use it in both functions.

  // retrieve all the collections at the root.
  const collections: CollectionReference[] = await clearedCollection(db);
  collections.forEach(x => processingQueue.push(x.path));

  while (!processingQueue.isEmpty()) {
    const currentPath: string = processingQueue.pop();
    const docs: DocumentReference[] = await db.collection(currentPath).listDocuments();

    // keep all docs subcollection to be deleted to,
    // delete every doc content.
    await runChunks(docs, async (doc: any) => {
      // Adding the current path to the subcollections to backup
      const subCollections = await doc.listCollections();
      subCollections.forEach((x: any) => processingQueue.push(x.path));

      // Delete the document
      return doc.delete();
    }, 500, false);
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
  await startMaintenance();

  console.info('Clearing the database');
  await clear();

  console.info('restoring file:', lastFile.name);
  const stream = lastFile.createReadStream();
  const lineReader = readline.createInterface({
    input: stream,
    terminal: false
  });


  const readerDone = new Promise(resolve => {
    lineReader.on('close', resolve);
  });

  stream.on('end', () => {
    lineReader.close();
  });

  const lines: any[] = [];
  lineReader.on('line', line => {
    lines.push(line);
  });

  await readerDone;

  await runChunks(lines, async (line: any) => {
    const stored: StoredDocument = JSON.parse(line);
    if (stored.docPath !== '_META/_MAINTENANCE') {
      await db.doc(stored.docPath).set(reEncodeObject(stored.content));
    }
  }, 500, false);

  await endMaintenance();

  console.info(`Done processing: ${lines.length - 1} lines loaded`);
  return resp.status(200).send('success');
};
