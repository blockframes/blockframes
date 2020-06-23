import { db, functions } from './internals/firebase';
import * as admin from 'firebase-admin';
import { set } from 'lodash';

async function getDocAndPath(data: functions.storage.ObjectMetadata) {
  // the storage path of the file
  const filePath = data.name;

  if (filePath === undefined) {
    throw new Error('Upload Error : Undefined File Path');
  }

  const filePathElements = filePath.split('/');

  if ( filePathElements.length < 4 ) {
    throw new Error(`Upload Error : File Path ${filePath}
    is malformed, it should at least contain 2 slash
    Example: 'collection/id/field/fileName'`);
  }

  const collection = filePathElements.shift()!;
  const docId = filePathElements.shift()!;

  // remove the file name at the end
  // `filePathElements` is now only composed by the field to update
  filePathElements.pop();

  const doc = db.collection(collection).doc(docId);
  const docSnapshot = await doc.get();

  if (!docSnapshot.exists) {
    throw new Error('Upload Error : File Path point to a firestore document that does not exists');
  }

  const docData = docSnapshot.data()!;

  const fieldToUpdate = filePathElements.join('.');

  return {
    filePath,
    doc,
    docData,
    fieldToUpdate
  }
}

/**
 * This function is executed on every files uploaded on the storage.
 *
 * It should **only** link the storage file to the firestore.
 *
 * Updating the firestore will cause an update event that will
 * eventually trigger post-processing (like image resize).
 */
export async function onFileUploadEvent(data: functions.storage.ObjectMetadata) {

  // get the needed values
  const { filePath, doc, docData, fieldToUpdate } = await getDocAndPath(data);

  // create an access url
  const bucket = admin.storage().bucket(data.bucket);
  const file = bucket.file(filePath);

  const [ exists ] = await file.exists();
  if (!exists) {
    throw new Error('Upload Error : File does not exists in the storage');
  }

  const [ signedUrl ] = await file.getSignedUrl({
    action: 'read',
    expires: '01-01-3000',
    version: 'v2'
  });

  // link the firestore
  const updatedDocData = set(docData, fieldToUpdate, { ref: filePath, url: signedUrl });

  return doc.set(updatedDocData, { merge: true });
}

/**
 * This function is executed on every files deleted from the storage.
 *
 * It should **only** unlink the storage file from the firestore.
 *
 * Updating the firestore will cause an update event that will
 * eventually trigger post-processing (like deleting other image size).
 * @note To unlink in firestore we don't delete the keys (`ref` and `url`)
 * but we simply replace them by an empty string to avoid
 * `cannot read property 'url' of undefined` errors
 */
export async function onFileDeleteEvent(data: functions.storage.ObjectMetadata) {

  // get the needed values
  const { doc, docData, fieldToUpdate } = await getDocAndPath(data);

  // unlink the firestore
  const updatedDocData = set(docData, fieldToUpdate, { ref: '', url: '' });

  return doc.set(updatedDocData, { merge: true });
}
