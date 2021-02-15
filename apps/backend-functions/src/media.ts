
// External dependencies
import { createHash } from 'crypto';
import { get, isEqual, set } from 'lodash';
import * as admin from 'firebase-admin';
import { storage } from 'firebase-functions';
import { CallableContext } from 'firebase-functions/lib/providers/https';

// Blockframes dependencies
import { getDocument } from '@blockframes/firebase-utils';
import { Meeting, Screening } from '@blockframes/event/+state/event.firestore';
import { createPublicUser, PublicUser, User } from '@blockframes/user/types';
import { StorageFile } from '@blockframes/media/+state/media.firestore';
import { FileMetaData, isValidMetadata } from '@blockframes/media/+state/media.model';
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

    /** Will throw if the condition is **false**. If the function throws it will delete/clean the file beforehand. */
    const assertFile = async (condition: boolean, message: string) => {
      if (!condition) {
        await file.delete();
        throw new Error(message);
      }
    };

    assertFile(isValid, `Invalid meta data for file ${data.name} : '${JSON.stringify(metadata)}'`);

    // because of possible nested map and arrays, we need to retrieve the whole document
    // modify it, then update the whole doc with the new (modified) version
    const docRef = db.collection(metadata.collection).doc(metadata.docId);
    const docSnap = await docRef.get();
    await assertFile(docSnap.exists, `Document ${metadata.collection}/${metadata.docId} does not exists`);
    const doc = docSnap.data()!;

    // (1) Security checks

    const notAllowedError = `User ${metadata.uid} not allowed to upload to ${metadata.collection}/${metadata.docId}`;

    // Is the user allowed to upload this file ?
    switch (metadata.collection) {
      case 'users': {
        // only the user is allowed to upload files about himself
        await assertFile(metadata.docId === metadata.uid, notAllowedError);
        break;

      } case 'movies': case 'campaigns': { // campaigns have the same ids as movies and business upload rules are the same
        // only users members of orgs which are part of a movie, are allowed to upload to this movie/campaign
        const user = await getDocument<User>(`users/${metadata.uid}`);
        await assertFile(!!user, notAllowedError);

        const movie = await getDocument<MovieDocument>(`movies/${metadata.docId}`);
        await assertFile(!!movie, notAllowedError);

        const isAllowed = movie.orgIds.some(orgId => orgId === user.orgId);
        await assertFile(isAllowed, notAllowedError);
        break;

      } case 'orgs': {
        // only member of an org can upload to this org
        const user = await getDocument<User>(`users/${metadata.uid}`);
        await assertFile(!!user, notAllowedError);
        await assertFile(user.orgId === metadata.docId, notAllowedError);
        break;

      } default: {
        await assertFile(false, `UNKNOWN COLLECTION : ${metadata.collection}`);
      }
    }

    // (2) copy file to final destination

    const segments = data.name.split('/');
    segments.shift(); // remove tmp/
    const finalPath = segments.join('/');
    const to = bucket.file(finalPath);

    await file.copy(to);

    // (3) update db

    // separate extraData from metadata
    const keysToDelete = [
      'uid',
      'firebaseStorageDownloadTokens',
    ];
    for (const key of keysToDelete) {
      delete metadata[key];
    }

    const uploadData: StorageFile = {
      ...metadata,
      storagePath: finalPath,
    }

    set(doc, metadata.field, uploadData); // update the whole doc with only the new storagePath & extraData

    await docRef.update(doc);

    // (4) delete tmp/file
    return file.delete();

  } else {

    if (!isValid) throw new Error('Invalid metadata after file copy');

    // Post processing such as: signal end of upload flow, trigger upload to JWPlayer, ...

    const isVideo = data.contentType.indexOf('video/') === 0 && metadata.collection === 'movies';
    if (isVideo) {

      const uploadResult = await uploadToJWPlayer(file);

      // There was an error when uploading file to jwPlayer
      if (!uploadResult.success) {
        console.error(`UPLOAD TO JWPLAYER FAILED: video ${data.name}`);
        if (uploadResult.message) {
          console.error(`An error occurred when uploading video to JwPlayer: ${uploadResult.message}`);
        }
        return false;
      }

      // upload success: we should add jwPlayerId to the db document
      const docRef = db.collection(metadata.collection).doc(metadata.docId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) return false;
      const doc = docSnap.data()!;
      set(doc, `${metadata.field}.jwPlayerId`, uploadResult.key); // update the whole doc with only the new jwPlayerId
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
export const getMediaToken = async (data: { file: StorageFile, parametersSet: ImageParameters[], eventId?: string }, context: CallableContext): Promise<string[]> => {

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }

  const canAccess = await isAllowedToAccessMedia(data.file, context.auth.uid, data.eventId);
  if (!canAccess) {
    throw new Error('Permission denied. User is not allowed');
  }

  return data.parametersSet.map((p: ImageParameters) => {
    const params = formatParameters(p);
    let toSign = `${imgixToken}${encodeURI(data.file.storagePath)}`;

    if (!!params) {
      toSign = `${toSign}?${params}`;
    }

    return createHash('md5').update(toSign).digest('hex');
  });

}

// TODO issue#4813 refactor
// TODO - to use parent object instead of storagePath
// TODO - check if parent object has a `jwPlayerId`, if so delete video from JWPlayer API
export const deleteMedia = async (storagePath: string): Promise<void> => {

  const bucket = admin.storage().bucket(getStorageBucketName());
  const file = bucket.file(storagePath);

  const [exists] = await file.exists();
  if (!exists) {
    console.log(`Upload Error : File "${storagePath}" does not exists in the storage`);
  } else {
    await file.delete();
  }
}

export async function isAllowedToAccessMedia(file: StorageFile, uid: string, eventId?: string): Promise<boolean> {

  const user = await db.collection('users').doc(uid).get();
  if (!user.exists) { return false; }
  const userDoc = createPublicUser(user.data());

  const blockframesAdmin = await db.collection('blockframesAdmin').doc(uid).get();
  if (blockframesAdmin.exists) { return true; }

  // We should not trust `privacy` & `storagePath` that comes from the parameters
  // instead we use `collection`, `docId` & `field` to retrieve the trusted values form the db
  const docData = await getDocument(`${file.collection}/${file.docId}`);
  const storageFile: StorageFile | undefined = get(docData, file.field);
  if (!storageFile) { return false; }
  const { privacy, storagePath } = storageFile;

  if (privacy === 'public') { return true; }

  let canAccess = false;
  switch (file.collection) {
    case 'users':
      canAccess = file.docId === uid;
      break;
    case 'orgs':
      if (!userDoc.orgId) { return false; }
      canAccess = file.docId === userDoc.orgId;
      break;
    case 'movies':
      if (!userDoc.orgId) { return false; }
      const moviesCol = await db.collection('movies').where('orgIds', 'array-contains', userDoc.orgId).get();
      const movies = moviesCol.docs.map(doc => doc.data());
      const orgIds = movies.map(m => m.orgIds)
      canAccess = orgIds.some(id => file.docId === id);
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

      const now = admin.firestore.Timestamp.now();

      // check if meeting is ongoing (not too early nor too late)
      if (now.seconds < eventData.start.seconds || now.seconds > eventData.end.seconds) {
        return false;
      }

      // if event is a Meeting and has the file
      if (eventData.type === 'meeting') {

        // Check if the given file exists among the event's files
        const match = (eventData.meta as Meeting).files.some(eventFile =>
          eventFile.privacy === privacy && // trusted value from db
          eventFile.collection === file.collection &&
          eventFile.docId === file.docId &&
          eventFile.field === file.field &&
          eventFile.storagePath === storagePath // trusted value from db
        );

        if (match) {
          // check if user is invited
          canAccess = await isUserInvitedToEvent(uid, eventId);
        }
      } else if (eventData.type === 'screening') {
        // only give access for this specific movie screener
        canAccess = file.field === 'promotional.screener'
          && file.docId === (eventData.meta as Screening).titleId;
      }
    }
  }

  return canAccess;
}


export async function cleanUserMedias(before: PublicUser, after?: PublicUser): Promise<void> {
  const mediaToDelete: string[] = [];
  if (!!after) { // Updating
    // Check if avatar have been changed/removed
    if (!!before.avatar && (before.avatar.storagePath !== after.avatar.storagePath || after.avatar.storagePath === '')) { // Avatar was previously setted and was updated or removed
      mediaToDelete.push(before.avatar.storagePath);
    }
  } else { // Deleting
    if (!!before.avatar) {
      mediaToDelete.push(before.avatar.storagePath);
    }

    if (!!before.watermark) {
      mediaToDelete.push(before.watermark.storagePath);
    }
  }

  await Promise.all(mediaToDelete.map(m => deleteMedia(m)));
}

export async function cleanOrgMedias(before: OrganizationDocument, after?: OrganizationDocument): Promise<void> {
  const mediaToDelete: string[] = [];
  if (!!after) { // Updating
    if (!!before.logo && (before.logo.storagePath !== after.logo.storagePath || after.logo.storagePath === '')) {
      mediaToDelete.push(before.logo.storagePath);
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
      mediaToDelete.push(before.logo.storagePath);
    }

    if (before.documents?.notes.length) {
      before.documents.notes.forEach(n => mediaToDelete.push(n.ref));
    }
  }

  await Promise.all(mediaToDelete.map(m => deleteMedia(m)));
}

export async function cleanMovieMedias(before: MovieDocument, after?: MovieDocument): Promise<void> {

  const needsToBeCleaned = (beforeStoragePath: string | undefined, afterStoragePath: string) => {
    return !!beforeStoragePath && beforeStoragePath !== afterStoragePath && afterStoragePath === '';
  };

  const mediaToDelete: string[] = [];
  if (!!after) { // Updating
    if (needsToBeCleaned(before.banner.storagePath, after.banner.storagePath)) {
      mediaToDelete.push(before.banner.storagePath);
    }

    if (needsToBeCleaned(before.poster.storagePath, after.poster.storagePath)) {
      mediaToDelete.push(before.poster.storagePath);
    }

    if (needsToBeCleaned(before.promotional.presentation_deck.storagePath, after.promotional.presentation_deck.storagePath)) {
      mediaToDelete.push(before.promotional.presentation_deck.storagePath);
    }

    if (needsToBeCleaned(before.promotional.scenario.storagePath, after.promotional.scenario.storagePath)) {
      mediaToDelete.push(before.promotional.scenario.storagePath);
    }

    if (needsToBeCleaned(before.promotional.moodboard.storagePath, after.promotional.moodboard.storagePath)) {
      mediaToDelete.push(before.promotional.moodboard.storagePath);
    }

    if (needsToBeCleaned(before.promotional.videos?.screener?.ref, after.promotional.videos?.screener?.ref)) {
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
        const stillBefore = photo.storagePath;
        const stillAfter = after.promotional.still_photo[index].storagePath;
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
      mediaToDelete.push(before.banner.storagePath);
    }

    if (!!before.poster) {
      mediaToDelete.push(before.poster.storagePath);
    }

    if (!!before.promotional.presentation_deck) {
      mediaToDelete.push(before.promotional.presentation_deck.storagePath);
    }

    if (!!before.promotional.scenario) {
      mediaToDelete.push(before.promotional.scenario.storagePath);
    }

    if (!!before.promotional.moodboard) {
      mediaToDelete.push(before.promotional.moodboard.storagePath);
    }

    if (!!before.promotional.videos?.screener?.ref) {
      mediaToDelete.push(before.promotional.videos.screener.ref);
    }

    if (before.promotional.videos?.otherVideos?.length) {
      before.promotional.videos.otherVideos.forEach(n => mediaToDelete.push(n.ref));
    }

    if (before.promotional.still_photo?.length) {
      before.promotional.still_photo.forEach(photo => mediaToDelete.push(photo.storagePath));
    }

    if (before.promotional.notes?.length) {
      before.promotional.notes.forEach(note => mediaToDelete.push(note.ref));
    }
  }

  await Promise.all(mediaToDelete.map(m => deleteMedia(m)));

}
