import { functions, getStorageBucketName } from './internals/firebase';
import * as admin from 'firebase-admin';
import { get } from 'lodash';
import { createHash } from 'crypto';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { imgixToken } from './environments/environment';
import { ImageParameters, formatParameters } from '@blockframes/media/directives/image-reference/imgix-helpers';
import { getDocAndPath } from '@blockframes/firebase-utils';



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

  // @TODO (#3188) check context if uid have right to linkFile

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

export const deleteMedia = async (data: { ref: string }, context: CallableContext): Promise<any> => {

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }

  // @TODO #3188 make other tests against DB here to validate user request

  const bucket = admin.storage().bucket(getStorageBucketName());
  const file = bucket.file(data.ref);

  const [exists] = await file.exists();
  if (!exists) {
    throw new Error('Upload Error : File does not exists in the storage');
  }

  return file.delete();
}