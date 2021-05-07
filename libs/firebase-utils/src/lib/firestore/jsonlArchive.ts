import { Writable } from "stream";
import { QueryDocumentSnapshot, QuerySnapshot } from '../types';
import { DbRecord } from '../util';
import { Bucket, File as GFile } from '@google-cloud/storage';
import readline from 'readline';
import { getLatestFile } from '../firebase-utils';
import admin from 'firebase-admin';
import { isArray, isEqual, isPlainObject, sortBy } from 'lodash';
import { runChunks } from "../firebase-utils";
import { META_COLLECTION_NAME } from "@blockframes/utils/maintenance";
import { Firestore } from "../types";
import { Queue } from "../queue";
import { CollectionReference, DocumentReference } from "../types";


export async function clearOld(db: FirebaseFirestore.Firestore) {
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
}

/**
 * Return all collection in the firestore instance provided, skip the collections
 * that should not be cleared.
 * @param firestore
 */

export async function clearedCollection(firestore: Firestore): Promise<CollectionReference[]> {
  // NOTE: this is legacy code, once upon a time we'd skip the backup of the _restore / _META collection
  // we disabled that, and this function might be useless now.
  return (await firestore.listCollections()).filter(x => x.id !== META_COLLECTION_NAME);
}


/**
 * Take a json object and re-encode its content to match our firebase storage.
 *
 * For example: transform {_second, _nanoseconds} objects back to firestore timestamps
 * objects.
 *
 * @param x the object to reencode
 * @returns a new object
 */
export function reEncodeObject(x: any): any {
  const KEYS_TIMESTAMP = sortBy(['_seconds', '_nanoseconds']);
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


export async function restoreFromBackupBucket(bucket: Bucket, db: FirebaseFirestore.Firestore, file?: string) {

  let restoreFile: GFile;

  if (file) {
    restoreFile = bucket.file(file);
  } else {
    const files: GFile[] = (await bucket.getFiles())[0];
    if (files.length === 0)
      throw new Error('Nothing to restore');
    restoreFile = getLatestFile(files);
  }

  const [fileExists] = await restoreFile.exists();

  if (fileExists) {
    console.log('Setting maintenance and activating import flag');
    console.log('Clearing the database');
    await clearOld(db);
    await importFirestoreFromGFile(restoreFile, db);
  } else {
    throw new Error('Nothing to restore');
  }
}




export async function importFirestoreFromGFile(firestoreBackupFile: GFile, db: FirebaseFirestore.Firestore) {
  console.log('restoring file:', firestoreBackupFile.name);
  const stream = firestoreBackupFile.createReadStream();
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

  const lines: string[] = [];
  lineReader.on('line', line => {
    lines.push(line);
  });

  await readerDone;

  await importFirestoreBackup(lines, db);

  console.log(`Done processing: ${lines.length - 1} lines loaded`);
}




export function importFirestoreBackup(jsonl: string[], db: FirebaseFirestore.Firestore) {
  return runChunks(jsonl, (line: string) => {
    const stored = JSON.parse(line) as DbRecord;
    if (stored.docPath !== '_META/_MAINTENANCE') {
      return db.doc(stored.docPath).set(reEncodeObject(stored.content));
    }
  }, 500, false);
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
  const collections: CollectionReference[] = await db.listCollections();
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



export async function getBackupOutput(bucket: Bucket, name: string): Promise<Writable> {
  const blob = bucket.file(`${name}.jsonl`);
  return blob.createWriteStream({ resumable: false });
}
