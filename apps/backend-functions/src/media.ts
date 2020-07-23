import { db, functions } from './internals/firebase';
import * as admin from 'firebase-admin';
import { get } from 'lodash';
import { HostedMedia } from '@blockframes/media/+state/media.model';

/**
 * 
 * @param filePath the storage path of the file
 */
export async function getDocAndPath(filePath: string) {

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
    throw new Error('File Path point to a firestore document that does not exists');
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
export async function linkFile(data: functions.storage.ObjectMetadata) {

  if (!data.name) {
    throw new Error('Upload Error : Undefined File Path');
  }

  // get the needed values
  const { filePath, doc, fieldToUpdate } = await getDocAndPath(data.name);

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
  // ! this will not work with array in the path like for poster
  return doc.update({[fieldToUpdate]: { ref: filePath, url: signedUrl } });
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
export async function unlinkFile(data: functions.storage.ObjectMetadata) {

  if (!data.name) {
    throw new Error('Delete Error : Undefined File Path');
  }

  // get the needed values
  const { doc, docData, fieldToUpdate } = await getDocAndPath(data.name);

  // if firestore wasn't link to this file, we should not unlink it
  const media: HostedMedia = get(docData, fieldToUpdate);
  if (data.name !== media.ref) {
    return;
  }

  // unlink the firestore
  // ! this will not work with array in the path like for poster
  return doc.update({[fieldToUpdate]: { ref: '', url: '' } });
}
