import { functions, getStorageBucketName } from './internals/firebase';
import * as admin from 'firebase-admin';
import { get } from 'lodash';
import { createHash } from 'crypto';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { imgixToken } from './environments/environment';
import { ImageParameters, formatParameters } from '@blockframes/media/directives/image-reference/imgix-helpers';
import { getDocAndPath } from '@blockframes/firebase-utils';
import { createPublicUser, PublicUser } from '@blockframes/user/types';
import { createOrganizationBase, OrganizationDocument } from '@blockframes/organization/+state/organization.firestore';
import { privacies } from '@blockframes/utils/file-sanitizer';
import { MovieDocument } from './data/types';

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

export const deleteMedia = async (ref: string): Promise<void> => {

  const bucket = admin.storage().bucket(getStorageBucketName());
  const file = bucket.file(ref);

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

  const blockframesAdmin = await db.collection('blockframesAdmin').doc(uid).get();
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


export async function cleanUserMedias(before: PublicUser, after?: PublicUser): Promise<void> {
  const mediaToDelete: string[] = [];
  if (!!after) { // Updating
    // Check if avatar have been changed/removed
    if (!!before.avatar && (before.avatar !== after.avatar || after.avatar === '')) { // Avatar was previously setted and was updated or removed
      mediaToDelete.push(before.avatar);
    }
  } else { // Deleting
    if (!!before.avatar) {
      mediaToDelete.push(before.avatar);
    }

    if (!!before.watermark) {
      mediaToDelete.push(before.watermark);
    }
  }

  await Promise.all(mediaToDelete.map(m => deleteMedia(m)));
}

export async function cleanOrgMedias(before: OrganizationDocument, after?: OrganizationDocument): Promise<void> {
  const mediaToDelete: string[] = [];
  if (!!after) { // Updating
    if (!!before.logo && (before.logo !== after.logo || after.logo === '')) {
      mediaToDelete.push(before.logo);
    }
  } else { // Deleting
    if (!!before.logo) {
      mediaToDelete.push(before.logo);
    }
  }

  await Promise.all(mediaToDelete.map(m => deleteMedia(m)));
}

export async function cleanMovieMedias(before: MovieDocument, after?: MovieDocument): Promise<void> {
  const mediaToDelete: string[] = [];
  if (!!after) { // Updating
    if (!!before.banner && (before.banner !== after.banner || after.banner === '')) {
      mediaToDelete.push(before.banner);
    }

    if (!!before.poster && (before.poster !== after.poster || after.poster === '')) {
      mediaToDelete.push(before.poster);
    }

    if (!!before.promotional.presentation_deck && (before.promotional.presentation_deck !== after.promotional.presentation_deck || after.promotional.presentation_deck === '')) {
      mediaToDelete.push(before.promotional.presentation_deck);
    }

    if (!!before.promotional.scenario && (before.promotional.scenario !== after.promotional.scenario || after.promotional.scenario === '')) {
      mediaToDelete.push(before.promotional.scenario);
    }

    Object.keys(before.promotional.still_photo)
      .filter(key => !!before.promotional.still_photo[key])
      .forEach(key => {
        const stillBefore = before.promotional.still_photo[key];
        const stillAfter = after.promotional.still_photo[key];
        if ((stillBefore !== stillAfter || stillAfter === '')) {
          mediaToDelete.push(stillBefore);
        }
      });

  } else { // Deleting

    if (!!before.banner) {
      mediaToDelete.push(before.banner);
    }

    if (!!before.poster) {
      mediaToDelete.push(before.poster);
    }

    if (!!before.promotional.presentation_deck) {
      mediaToDelete.push(before.promotional.presentation_deck);
    }

    if (!!before.promotional.scenario) {
      mediaToDelete.push(before.promotional.scenario);
    }

    Object.keys(before.promotional.still_photo)
      .filter(key => !!before.promotional.still_photo[key])
      .forEach(key => mediaToDelete.push(before.promotional.still_photo[key]));
  }

  await Promise.all(mediaToDelete.map(m => deleteMedia(m)));

}
