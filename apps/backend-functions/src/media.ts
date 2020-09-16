import { functions, getStorageBucketName } from './internals/firebase';
import * as admin from 'firebase-admin';
import { get } from 'lodash';
import { createHash } from 'crypto';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { imgixToken } from './environments/environment';
import { ImageParameters, formatParameters } from '@blockframes/media/directives/image-reference/imgix-helpers';
import { getDocAndPath } from '@blockframes/firebase-utils';
import { createPublicUser } from '@blockframes/user/types';
import { privacies } from '@blockframes/utils/file-sanitizer';
import { createOrganizationBase } from '@blockframes/organization/+state/organization.firestore';

/**
 * This function is executed on every files uploaded on the tmp directory of the storage.
 * It check if a new file in tmp directory is already referenced on DB and movie it to correct folder
 */
export async function linkFile(data: functions.storage.ObjectMetadata) {
  // get the needed values
  const { filePath, fieldToUpdate, isInTmpDir, docData } = await getDocAndPath(data.name);

  if (isInTmpDir && data.name) {
    const savedRef: string = get(docData, fieldToUpdate);
    const bucket = admin.storage().bucket(getStorageBucketName());
    const from = bucket.file(data.name);
    if (filePath === savedRef) {
      const to = bucket.file(filePath);
      const [exists] = await from.exists();
      if (exists) {
        // Copy file to new location
        await from.copy(to);
        // Remove previous
        await from.delete();
      }
      return true;
    } else {
      // If the ref is not found on db, we delete the file because it means that it is lost
      await from.delete();
    }

  }
  return false;
}

/**
 * This function is executed on every files deleted from the storage.
 *
 * It should **only** unlink the storage file from the firestore.
 *
 */
export async function unlinkFile(data: functions.storage.ObjectMetadata) {

  // get the needed values
  const { doc, docData, fieldToUpdate, isInTmpDir } = await getDocAndPath(data.name);

  if (!isInTmpDir) {

    // if firestore wasn't link to this file, we should not unlink it
    const ref: string = get(docData, fieldToUpdate);
    if (data.name !== ref) {
      return;
    }

    // unlink the firestore
    return doc.update({ [fieldToUpdate]: '' });
  } else {
    return false;
  }
}

/**
 * Generates an Imgix token for a given protected resource
 * Protected resources are in the "protected" dir of the bucket.
 * An Imgix source must be configured to that directory and marked as private
 * 
 * @param data 
 * @param context 
 * @see https://github.com/imgix/imgix-blueprint#securing-urls
 * @see https://www.notion.so/cascade8/Setup-ImgIx-c73142c04f8349b4a6e17e74a9f2209a
 */
export const getMediaToken = async (data: { ref: string, parametersSet: ImageParameters[] }, context: CallableContext): Promise<string[]> => {

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }

  const canAccess = await isAllowedToAccessMedia(data.ref, context.auth.uid);
  if (!canAccess) {
    throw new Error('Permission denied. User is not allowed');
  }

  return data.parametersSet.map((p: ImageParameters) => {
    const params = formatParameters(p);
    let toSign = `${imgixToken}${data.ref}`;

    if (!!params) {
      toSign = `${toSign}?${params}`;
    }

    return createHash('md5').update(toSign).digest('hex');
  });

}

export const deleteMedia = async (data: { ref: string }, context: CallableContext): Promise<void> => {

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }

  const canDelete = await isAllowedToAccessMedia(data.ref, context.auth.uid);
  if (!canDelete) {
    throw new Error('Permission denied. User is not allowed');
  }

  const bucket = admin.storage().bucket(getStorageBucketName());
  const file = bucket.file(data.ref);

  const [exists] = await file.exists();
  if (!exists) {
    throw new Error('Upload Error : File does not exists in the storage');
  }

  await file.delete();
}

async function isAllowedToAccessMedia(ref: string, uid: string): Promise<boolean> {
  const pathInfo = getPathInfo(ref);
  const db = admin.firestore();

  const user = await db.collection('users').doc(uid).get();
  if (!user.exists) { return false; }
  const userDoc = createPublicUser(user.data());

  const blockframesAdmin = await  db.collection('blockframesAdmin').doc(uid).get();
  if (blockframesAdmin.exists) { return true; }

  switch (pathInfo.collection) {
    case 'users':
      return pathInfo.docId === uid;
    case 'orgs':
      if (!userDoc.orgId) { return false; }
      return pathInfo.docId === userDoc.orgId;
    case 'movies':
      if (!userDoc.orgId) { return false; }
      const org = await db.collection('orgs').doc(userDoc.orgId).get();
      const orgDoc = createOrganizationBase(org.data());
      return orgDoc.movieIds.some(id => pathInfo.docId === id);
    default:
      return false;
  }
}

function getPathInfo(ref: string) {
  const refParts = ref.split('/');

  const pathInfo: Record<string, string | undefined> = {};
  if (privacies.includes(refParts[0] as any)) {
    pathInfo.securityLevel = refParts.shift();
  }

  pathInfo.collection = refParts.shift();
  pathInfo.docId = refParts.shift();

  return pathInfo;
}