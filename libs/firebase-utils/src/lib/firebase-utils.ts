import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { chunk } from "lodash";
import * as env from '@env'
import type { File as GFile } from '@google-cloud/storage';
import { dissectFilePath } from "@blockframes/utils/file-sanitizer";

export function getDocument<T>(path: string): Promise<T> {
  const db = admin.firestore();
  return db
    .doc(path)
    .get()
    .then(doc => doc.data() as T);
}

export function getCollectionRef<T>(path: string): Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>> {
  const db = admin.firestore();
  return db
    .collection(path)
    .get();
}

export function getCollection<T>(path: string): Promise<T[]> {
  return getCollectionRef(path).then(collection => collection.docs.map(doc => doc.data() as T));
}

/**
 *
 * @param filePath the storage path of the file
 */
export async function getDocAndPath(filePath: string | undefined) {
  const db = admin.firestore();

  const { collection, docId, isInTmpDir, security, fieldToUpdate } = dissectFilePath(filePath)  

  const doc = db.collection(collection).doc(docId);
  const docSnapshot = await doc.get();

  if (!docSnapshot.exists) {
    throw new Error('File Path point to a firestore document that does not exists');
  }
  const docData = docSnapshot.data();

  return {
    isInTmpDir,
    security,
    filePath,
    doc,
    docData,
    fieldToUpdate,
    collection
  }
}

export async function runChunks(rows: any[], cb: any, rowsConcurrency?: number, verbose = true) {
  const chunks = chunk(rows, rowsConcurrency || env?.['chunkSize'] || 10);
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    if (verbose) { console.log(`Processing chunk ${i + 1}/${chunks.length}`); }
    const promises = c.map(cb);
    await Promise.all(promises);
  }
}

/**
 * Helper to work in local / remote dev mode:
 * in local the function config will be empty and this function will return an undefined value.
 * Later, when we test the backend functions code, we'll let dev define env variables
 * for local testing.
 *
 * @param path the field path to look for, ['x', 'y'] will look for config.x.y
 */
export const mockConfigIfNeeded = (...path: string[]): any =>
  path.reduce((config: any, field) => (config ? config[field] : undefined), functions.config());

/**
 * Sorts an array of files in a bucket by timeCreated and returns the latest
 * @param files GCP file type
 */
export function getLatestFile(files: GFile[]) {
  return files
    .sort(
      (a, b) =>
        Number(new Date(a.metadata?.timeCreated)) - Number(new Date(b.metadata?.timeCreated))
    )
    .pop();
}
