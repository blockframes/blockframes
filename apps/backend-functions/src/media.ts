
// External dependencies
import { createHash } from 'crypto';
import { isEqual, set } from 'lodash';
import * as admin from 'firebase-admin';
import { storage } from 'firebase-functions';
import { CallableContext } from 'firebase-functions/lib/providers/https';

// Blockframes dependencies
import { getDocument } from '@blockframes/firebase-utils';
import { Meeting } from '@blockframes/event/+state/event.firestore';
import { createPublicUser, PublicUser, User } from '@blockframes/user/types';
import { FileMetaData, isValidMetadata } from '@blockframes/media/+state/media.firestore';
import { privacies, Privacy, tempUploadDir } from '@blockframes/utils/file-sanitizer';
import { OrganizationDocument } from '@blockframes/organization/+state/organization.firestore';
import { ImageParameters, formatParameters } from '@blockframes/media/image/directives/imgix-helpers';

// Internal dependencies
import { uploadToJWPlayer } from './player';
import { MovieDocument } from './data/types';
import { imgixToken } from './environments/environment';
import { db, getStorageBucketName } from './internals/firebase';
import { isUserInvitedToEvent } from './internals/invitations/events';


/**
 * This function is executed on every files uploaded on the tmp directory of the storage.
 * It check if a new file in tmp directory is already referenced on DB and movie it to correct folder
 */
export async function linkFile(data: storage.ObjectMetadata) {

  if (!data.name) return false;

  const bucket = admin.storage().bucket(getStorageBucketName());
  const file = bucket.file(data.name);

  // metadata is composed of claims of where the user wants to upload the file:
  // privacy, collection, docId, field
  // the metadata also contain the user uid,
  // which has been verified by storage rules and can be trusted
  const metadata = data.metadata as FileMetaData;
  const isValid = isValidMetadata(metadata, { uidRequired: true });

  const [ tmp ] = data.name.split('/');
  if ( tmp === tempUploadDir ) {

    // (1) Security checks, (2) copy file to final destination, (3) update db, (4) delete tmp/file

    const cleanAndReturn = async (success: boolean) => {
      await file.delete();
      return success;
    };

    if (!isValid) return cleanAndReturn(false);

    // (1) Security checks

    // Is the user allowed to upload this file ?
    switch (metadata.collection) {
      case 'users': {
        // only the user is allowed to upload files about himself
        if (metadata.docId !== metadata.uid) return cleanAndReturn(false);
        break;

      } case 'movies':
      case 'campaigns': { // campaigns have the same ids as movies and business upload rules are the same
        // only users members of orgs which are part of a movie, are allowed to upload to this movie/campaign
        const user = await getDocument<User>(`users/${metadata.uid}`);
        if (!user) return cleanAndReturn(false);
        const movie = await getDocument<MovieDocument>(`movies/${metadata.docId}`);
        if (!movie) return cleanAndReturn(false);
        const isAllowed = movie.orgIds.some(orgId => orgId === user.orgId);
        if (!isAllowed) return cleanAndReturn(false);
        break;

      } case 'orgs': {
        // only member of an org can upload to this org
        const user = await getDocument<User>(`users/${metadata.uid}`);
        if (!user) return cleanAndReturn(false);
        if (user.orgId !== metadata.docId) return cleanAndReturn(false);
        break;

      } default: {
        console.error(`UNKNOWN COLLECTION : ${metadata.collection}`);
        return cleanAndReturn(false);
      }
    }

    // (2) copy file to final destination

    const segments = data.name.split('/');
    segments.shift(); // remove tmp/
    const finalPath = segments.join('/');
    const to = bucket.file(finalPath);
    const [exists] = await file.exists();
    if (!exists) {
      return cleanAndReturn(false);
    }

    await file.copy(to);

    // (3) update db
    // because of possible nested map and arrays, we need to retrieve the whole document
    // modify it, then update the whole doc with the new (modified) version

    const docRef = db.collection(metadata.collection).doc(metadata.docId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return cleanAndReturn(false);
    const doc = docSnap.data()!;

    // TODO issue#4002 refactor as set(doc, metadata.field, { ref: finalPath});
    set(doc, metadata.field, finalPath); // update the whole doc with only the new ref

    await docRef.update(doc);

    // (4) delete tmp/file
    return cleanAndReturn(true);

  } else {

    if (!isValid) throw new Error('Invalid metadata after file copy');

    // Post processing such as: signal end of upload flow, trigger upload to JWPlayer, ...

    if (data.contentType.indexOf('video/') === 0 && metadata.collection === 'movies') {

      const uploadResult = await uploadToJWPlayer(file);

      // There was an error when uploading file to jwPlayer
      if (!uploadResult.success) {
        console.error(`UPLOAD TO JWPLAYER FAILED: video ${data.name}`);
        if (uploadResult.message) {
          console.error(`An error occurred when uploading video to JwPlayer: ${uploadResult.message}`);
        }
        return false;
      }

      // TODO issue#4002 use field and stop computing the videoField
      // upload success: we should add jwPlayerId to the db document
      const segmentedField = metadata.field.split('.');
      segmentedField.pop(); // remove `.ref` to get the whole video object instead of the ref/path
      segmentedField.push('jwPlayerId');
      const videoField = segmentedField.join('.');

      const docRef = db.collection(metadata.collection).doc(metadata.docId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) return false;
      const doc = docSnap.data()!;
      set(doc, videoField, uploadResult.key); // update the whole doc with only the new ref
      await docRef.update(doc);

      return true;
    }
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
