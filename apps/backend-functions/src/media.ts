import { db, functions } from './internals/firebase';
import * as admin from 'firebase-admin';
import { get } from 'lodash';
import { createHash } from 'crypto';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { imgixToken } from './environments/environment';
import { ImageParameters, formatParameters } from '@blockframes/media/directives/image-reference/imgix-helpers';

/**
 *
 * @param filePath the storage path of the file
 */
export async function getDocAndPath(filePath: string | undefined) {

  if (!filePath) {
    throw new Error('Upload Error : Undefined File Path');
  }

  const filePathElements = filePath.split('/');

  if (filePathElements.length < 4) {
    throw new Error(`Upload Error : File Path ${filePath}
    is malformed, it should at least contain 2 slash
    Example: 'collection/id/field/fileName'`);
  }

  // remove "protected/"" or "public/"
  if (['protected', 'public'].includes(filePathElements[0])) {
    filePathElements.shift();
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

  // get the needed values
  const { filePath, doc, fieldToUpdate } = await getDocAndPath(data.name);

  // create an access url
  const bucket = admin.storage().bucket(data.bucket);
  const file = bucket.file(filePath);

  const [exists] = await file.exists();
  if (!exists) {
    throw new Error('Upload Error : File does not exists in the storage');
  }

  // link the firestore
  // ! this will not work with array in the path like for poster
  return doc.update({ [fieldToUpdate]: filePath });
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

  // get the needed values
  const { doc, docData, fieldToUpdate } = await getDocAndPath(data.name);

  // if firestore wasn't link to this file, we should not unlink it
  const ref: string = get(docData, fieldToUpdate);
  if (data.name !== ref) {
    return;
  }

  // unlink the firestore
  // ! this will not work with array in the path like for poster
  return doc.update({ [fieldToUpdate]: '' });
}

/**
 * Generates an Imgix token for a given protected resource
 * Protected resources are in the "protected" dir of the bucket.
 * An Imgix source must be configured to that directory and marked as private
 * 
 * @param data 
 * @param context 
 * @see https://github.com/imgix/imgix-blueprint#securing-urls
 * @see https://www.notion.so/cascade8/Setup-ImgIx-c73142c04f8349b4a6e17e74a9f2209a // @TODO #3188 add how to create a private source
 */
export const getMediaToken = (data: { ref: string, parametersSet: ImageParameters[] }, context: CallableContext): string[] => {

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }

  // @TODO #3188 make other tests against DB here to validate user request to media

  return data.parametersSet.map((p: ImageParameters) => {
    const params = formatParameters(p);
    let toSign = `${imgixToken}${data.ref}`;

    if (!!params) {
      toSign = `${toSign}?${params}`;
    }

    return createHash('md5').update(toSign).digest('hex');
  });

}