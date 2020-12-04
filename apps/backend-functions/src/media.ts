import { getStorageBucketName } from './internals/firebase';
import * as admin from 'firebase-admin';
import { get, isEqual } from 'lodash';
import { createHash } from 'crypto';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { imgixToken } from './environments/environment';
import { ImageParameters, formatParameters } from '@blockframes/media/directives/image-reference/imgix-helpers';
import { getDocAndPath } from '@blockframes/firebase-utils';
import { createPublicUser, PublicUser } from '@blockframes/user/types';
import { OrganizationDocument } from '@blockframes/organization/+state/organization.firestore';
import { privacies, Privacy } from '@blockframes/utils/file-sanitizer';
import { MovieDocument } from './data/types';
import { uploadToJWPlayer } from './player';
import { HostedVideo } from '@blockframes/movie/+state/movie.firestore';
import { storage } from 'firebase-functions';
import { Meeting } from '@blockframes/event/+state/event.firestore';
import { isUserInvitedToEvent } from './internals/invitations/events';

/**
 * This function is executed on every files uploaded on the tmp directory of the storage.
 * It check if a new file in tmp directory is already referenced on DB and movie it to correct folder
 */
export async function linkFile(data: storage.ObjectMetadata) {
  // get the needed values
  const { filePath, field, isTmp, docData, collection, doc } = await getDocAndPath(data.name);

  if (isTmp && data.name) {
    let savedRef: any = get(docData, field);

    if (Array.isArray(savedRef)) {
      savedRef = savedRef.map(e => e.ref || e).find(ref => ref === filePath) || '';
    } else if (!!savedRef.ref) {
      savedRef = savedRef.ref;
    }

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

        // If file is a video
        const [fileMetaData] = await to.getMetadata();
        if (fileMetaData.contentType.indexOf('video/') === 0 && collection === 'movies') {

          const uploadResult = await uploadToJWPlayer(to);

          const hostedVideos: HostedVideo | HostedVideo[] = get(docData, field);

          let update: HostedVideo | HostedVideo[] | {};
          if (uploadResult.success) {
            if (Array.isArray(hostedVideos)) {
              update = hostedVideos.map(video => {
                if (video.ref === savedRef) { video.jwPlayerId = uploadResult.key };
                return video;
              });
            } else {
              hostedVideos.jwPlayerId = uploadResult.key;
              update = hostedVideos;
            }
          } else {
            // There was an error when uploading file to jwPlayer

            if (uploadResult.message) {
              console.log(`An error occured when uploading video to JwPlayer: ${uploadResult.message}`);
            }

            if (Array.isArray(hostedVideos)) {
              update = hostedVideos.filter(video => video.ref !== savedRef);
            } else {
              update = {};
            }
          }
          await doc.update({ [field]: update });
        }
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
export const getMediaToken = async (data: { ref: string, parametersSet: ImageParameters[], eventId?: string }, context: CallableContext): Promise<string[]> => {

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }

  const canAccess = await isAllowedToAccessMedia(data.ref, context.auth.uid, data.eventId);
  if (!canAccess) {
    throw new Error('Permission denied. User is not allowed');
  }

  return data.parametersSet.map((p: ImageParameters) => {
    const params = formatParameters(p);
    let toSign = `${imgixToken}${encodeURI(data.ref)}`;

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
    console.log(`Upload Error : File "${ref}" does not exists in the storage`);
  } else {
    await file.delete();
  }
}

async function isAllowedToAccessMedia(ref: string, uid: string, eventId?: string): Promise<boolean> {
  const pathInfo = getPathInfo(ref);
  const db = admin.firestore();

  const user = await db.collection('users').doc(uid).get();
  if (!user.exists) { return false; }
  const userDoc = createPublicUser(user.data());

  const blockframesAdmin = await db.collection('blockframesAdmin').doc(uid).get();
  if (blockframesAdmin.exists) { return true; }

  let canAccess = false;
  switch (pathInfo.collection) {
    case 'users':
      canAccess = pathInfo.docId === uid;
      break;
    case 'orgs':
      if (!userDoc.orgId) { return false; }
      canAccess = pathInfo.docId === userDoc.orgId;
      break;
    case 'movies':
      if (!userDoc.orgId) { return false; }
      const moviesCol = await db.collection('movies').where('orgIds', 'array-contains', userDoc.orgId).get();
      const movies = moviesCol.docs.map(doc => doc.data());
      const orgIds = movies.map(m => m.orgIds)
      canAccess = orgIds.some(id => pathInfo.docId === id);
      break;
    default:
      canAccess = false;
      break;
  }

  // use is not currently authorized,
  // but he might be invited to an event where the file is shared
  if (!canAccess && !!eventId) {
    const eventRef = db.collection('events').doc(eventId);
    const eventSnap = await eventRef.get();

    if (eventSnap.exists) {

      const eventData = eventSnap.data()!;

      // if event is a Meeting and has the file
      if (eventData.type === 'meeting') {

        // event.meta.files store the raw refs, but the ref in the function params
        // has been transformed by the front, so we must apply the same transformations
        // if we want to be able to match ref & files
        const match = (eventData.meta as Meeting).files.some(file => {

          if (file.startsWith('/')) file = file.substr(1); // remove leading '/' if exists
          const fileParts = file.split('/');
          fileParts.shift(); // remove privacy
          let normalizedFile = fileParts.join('/');
          if (!normalizedFile.startsWith('/')) normalizedFile = `/${normalizedFile}`; // put back a leading '/'

          return normalizedFile === ref;
        })

        if (match) {
          // check if user is invited
          canAccess = await isUserInvitedToEvent(uid, eventId);
        }
      }
    }
  }

  return canAccess;
}

interface PathInfo { securityLevel: Privacy, collection: string, docId: string }

function getPathInfo(ref: string) {
  const refParts = ref.split('/').filter(v => !!v);

  const pathInfo: PathInfo = {
    securityLevel: 'protected', // protected by default
    collection: '',
    docId: '',
  };

  if (privacies.includes(refParts[0] as any)) {
    pathInfo.securityLevel = refParts.shift()! as Privacy;
  }

  pathInfo.collection = refParts.shift()!;
  pathInfo.docId = refParts.shift()!;

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

    if (before.documents?.notes.length) {
      before.documents.notes.forEach(nb => {
        if (!after.documents?.notes.length || !after.documents.notes.some(na => na.ref === nb.ref)) {
          mediaToDelete.push(nb.ref);
        }
      });
    }

  } else { // Deleting
    if (!!before.logo) {
      mediaToDelete.push(before.logo);
    }

    if (before.documents?.notes.length) {
      before.documents.notes.forEach(n => mediaToDelete.push(n.ref));
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

    if (!!before.promotional.moodboard && (before.promotional.moodboard !== after.promotional.moodboard || after.promotional.moodboard === '')) {
      mediaToDelete.push(before.promotional.moodboard);
    }

    if (!!before.promotional.videos?.screener?.ref &&
      (before.promotional.videos.screener?.ref !== after.promotional.videos?.screener?.ref || after.promotional.videos?.screener?.ref === '')) {
      mediaToDelete.push(before.promotional.videos.screener.ref);
    }

    if (before.promotional.videos?.otherVideos?.length) {
      before.promotional.videos.otherVideos.forEach(vb => {
        if (!after.promotional.videos?.otherVideos?.length || !after.promotional.videos.otherVideos.some(va => va.ref === vb.ref)) {
          mediaToDelete.push(vb.ref);
        }
      });
    }

    if (before.promotional.still_photo?.length) {
      before.promotional.still_photo.forEach((photo, index) => {
        const stillBefore = photo
        const stillAfter = after.promotional.still_photo[index];
        if ((stillBefore !== stillAfter || stillAfter === '')) {
          mediaToDelete.push(stillBefore);
        }
      });
    }

    if (before.promotional.notes?.length) {
      before.promotional.notes.forEach((note, index) => {
        const noteBefore = note;
        const noteAfter = after.promotional.notes[index];
        if ((!isEqual(noteBefore, noteAfter) || isEqual(noteAfter, {}))) {
          mediaToDelete.push(noteBefore.ref);
        }
      });
    }

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

    if (!!before.promotional.moodboard) {
      mediaToDelete.push(before.promotional.moodboard);
    }

    if (!!before.promotional.videos?.screener?.ref) {
      mediaToDelete.push(before.promotional.videos.screener.ref);
    }

    if (before.promotional.videos?.otherVideos?.length) {
      before.promotional.videos.otherVideos.forEach(n => mediaToDelete.push(n.ref));
    }

    if (before.promotional.still_photo?.length) {
      before.promotional.still_photo.forEach(photo => mediaToDelete.push(photo));
    }

    if (before.promotional.notes?.length) {
      before.promotional.notes.forEach(note => mediaToDelete.push(note.ref));
    }
  }

  await Promise.all(mediaToDelete.map(m => deleteMedia(m)));

}
