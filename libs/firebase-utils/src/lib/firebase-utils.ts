import * as admin from 'firebase-admin';
import { chunk } from "lodash";
import * as env from '@env'
import { tempUploadDir, privacies } from "@blockframes/utils/file-sanitizer";

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

  if (!filePath) {
    throw new Error('Upload Error : Undefined File Path');
  }

  const filePathElements = filePath.split('/');

  if (filePathElements.length < 4) {
    const error = `Upload Error : File Path ${filePath} is malformed.`;
    const solution = 'It should at least contain 3 slash.';
    const example = 'Example: public/collection/id/field/fileName';
    throw new Error(`${error} ${solution}\n${example}`);
  }

  // remove tmp/
  let isInTmpDir = false;
  if (filePathElements[0] === tempUploadDir) {
    filePathElements.shift();
    filePath = filePathElements.join('/');
    isInTmpDir = true;
  }

  let security;
  // remove "protected/"" or "public/"
  if (privacies.includes(filePathElements[0] as any)) {
    security = filePathElements.shift();
  }

  const collection = filePathElements.shift();
  const docId = filePathElements.shift();

  if (!docId || !collection) {
    throw new Error('Invalid path pattern');
  }

  // remove the file name at the end
  // `filePathElements` is now only composed by the field to update
  filePathElements.pop();

  const doc = db.collection(collection).doc(docId);
  const docSnapshot = await doc.get();

  if (!docSnapshot.exists) {
    throw new Error('File Path point to a firestore document that does not exists');
  }

  const docData = docSnapshot.data();

  const fieldToUpdate = filePathElements.join('.');

  return {
    isInTmpDir,
    security,
    filePath,
    doc,
    docData,
    fieldToUpdate
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
