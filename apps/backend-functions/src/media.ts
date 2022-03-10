
// External dependencies
import { createHash } from 'crypto';
import { get, set } from 'lodash';
import * as admin from 'firebase-admin';
import { logger, storage } from 'firebase-functions';
import { CallableContext } from 'firebase-functions/lib/providers/https';

// Blockframes dependencies
import { PublicUser, User } from '@blockframes/model';
import { StorageFile, StorageVideo } from '@blockframes/media/+state/media.firestore';
import { FileMetaData, isValidMetadata } from '@blockframes/media/+state/media.model';
import { tempUploadDir } from '@blockframes/utils/file-sanitizer';
import { OrganizationDocument } from '@blockframes/model';
import { ImageParameters, formatParameters } from '@blockframes/media/image/directives/imgix-helpers';

// Internal dependencies
import { deleteFromJWPlayer, uploadToJWPlayer } from './player';
import { MovieDocument } from './data/types';
import { imgixToken } from './environments/environment';
import { db, getStorageBucketName } from './internals/firebase';
import { isAllowedToAccessMedia } from './internals/media';
import { testVideoId } from '@env';
import { getDeepValue } from './internals/utils';


/**
 * This function is executed on every files uploaded on the tmp directory of the storage.
 * It check if a new file in tmp directory is already referenced on DB and move it to correct folder
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

  // metadata.uid is copied into uploaderUid for context consistency during transaction execution.
  // If transaction is locked by another process, it will fail to update the doc, and will try with a new attempt
  // but metadata.uid as already been removed (delete metadata[key];)
  const uploaderUid = metadata?.uid;
  const [tmp] = data.name.split('/');
  if (tmp === tempUploadDir) {

    // (1) Security checks, (2) copy file to final destination, (3) update db, (4) delete tmp/file

    /** Will throw if the condition is **false**. If the function throws it will delete/clean the file beforehand. */
    const assertFile = async (condition: boolean, message: string) => {
      if (!condition) {
        await file.delete();
        throw new Error(message);
      }
    };

    await assertFile(isValid, `Invalid meta data for file ${data.name} : '${JSON.stringify(metadata)}'`);

    await db.runTransaction(async transaction => {
      // because of possible nested map and arrays, we need to retrieve the whole document
      // modify it, then update the whole doc with the new (modified) version
      const docRef = db.collection(metadata.collection).doc(metadata.docId);
      const docSnap = await transaction.get(docRef);
      await assertFile(docSnap.exists, `Document ${metadata.collection}/${metadata.docId} does not exists`);
      const doc = docSnap.data();

      // (1) Security checks

      const blockframesAdminRef = db.doc(`blockframesAdmin/${uploaderUid}`);
      const blockframesAdminSnap = await transaction.get(blockframesAdminRef);
      if (!blockframesAdminSnap.exists) {

        const notAllowedError = `User ${uploaderUid} not allowed to upload to ${metadata.collection}/${metadata.docId}`;

        // Is the user allowed to upload this file ?
        switch (metadata.collection) {
          case 'users': {
            // only the user is allowed to upload files about himself
            await assertFile(metadata.docId === uploaderUid, notAllowedError);
            break;

          }
          case 'movies':
          case 'campaigns': {
            // only users members of orgs which are part of a movie, are allowed to upload to this movie/campaign
            const userRef = db.collection('users').doc(uploaderUid);
            const userSnap = await transaction.get(userRef);
            await assertFile(userSnap.exists, notAllowedError);

            const movieRef = db.collection('movies').doc(metadata.docId);
            const movieSnap = await transaction.get(movieRef);
            await assertFile(movieSnap.exists, notAllowedError);

            const user = userSnap.data() as User;
            const movie = movieSnap.data() as MovieDocument;
            const isAllowed = movie.orgIds.some(orgId => orgId === user.orgId);
            await assertFile(isAllowed, notAllowedError);
            break;

          }
          case 'orgs': {
            // only member of an org can upload to this org
            const userRef = db.collection('users').doc(uploaderUid);
            const userSnap = await transaction.get(userRef);
            await assertFile(userSnap.exists, notAllowedError);
            const user = userSnap.data() as User;
            await assertFile(user.orgId === metadata.docId, notAllowedError);
            break;

          }
          default: {
            await assertFile(false, `UNKNOWN COLLECTION : ${metadata.collection}`);
          }
        }
      }

      // (2) copy file to final destination

      const segments = data.name.split('/');
      segments.shift(); // remove tmp/
      const finalPath = segments.join('/');
      const to = bucket.file(`${metadata.privacy}/${finalPath}`);

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

      let fieldValue: StorageFile | StorageFile[] = get(doc, metadata.field);

      if (Array.isArray(fieldValue)) {
        fieldValue.push(uploadData);
      } else {
        fieldValue = uploadData;
      }

      set(doc, metadata.field, fieldValue);

      await transaction.update(docRef, doc);
    }).catch(err => console.error('Transaction Failed:', err));

    // (4) delete tmp/file
    return file.delete();

  } else {

    if (!isValid) throw new Error('Invalid metadata after file copy');

    // Post processing such as: signal end of upload flow, trigger upload to JWPlayer, ...

    const isVideo = data.contentType.indexOf('video/') === 0 && ['movies', 'orgs'].includes(metadata.collection);
    if (isVideo && metadata.moving !== 'true') {

      const uploadResult = await uploadToJWPlayer(file);

      // There was an error when uploading file to jwPlayer
      if (!uploadResult.success) {
        console.error(`UPLOAD TO JWPLAYER FAILED: video ${data.name}`);
        if (uploadResult.message) {
          console.error(`An error occurred when uploading video to JwPlayer: ${uploadResult.message}`);
        }
        return false;
      }

      await db.runTransaction(async transaction => {
        // upload success: we should add jwPlayerId to the db document
        const docRef = db.collection(metadata.collection).doc(metadata.docId);
        const docSnap = await transaction.get(docRef);
        if (!docSnap.exists) return false;
        const doc = docSnap.data();

        const fieldValue: StorageVideo | StorageVideo[] = get(doc, metadata.field);
        if (Array.isArray(fieldValue)) {

          const index = fieldValue.findIndex(video => video.fileId === metadata.fileId);

          if (index < 0) {
            console.error(`UPDATE DB FAILED: Video ${uploadResult.key} was successfully uploaded to JWPlayer, but we didn't found the db document to update`, JSON.stringify(data.name), JSON.stringify(data.metadata));
            return false;
          }

          fieldValue[index].jwPlayerId = uploadResult.key;

        } else {
          fieldValue.jwPlayerId = uploadResult.key;
        }

        set(doc, metadata.field, fieldValue); // update the whole doc with only the new jwPlayerId
        await transaction.update(docRef, doc);
      });
      return true;
    } else if (metadata.moving === 'true') {
      // removing the 'moving' flag from metadata 
      file.setMetadata({ metadata: { moving: null } });
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

    // ImgIx secured URLs doc : https://github.com/imgix/imgix-blueprint#securing-urls

    // add a leading '/' to the path if it doesn't exists
    const storagePath = data.file.storagePath.startsWith('/') ? data.file.storagePath : `/${data.file.storagePath}`;
    let toSign = `${imgixToken}${encodeURI(storagePath)}`;

    const params = formatParameters(p);
    if (params) {
      toSign = `${toSign}?${params}`;
    }

    return createHash('md5').update(toSign).digest('hex');
  });

}

export const deleteMedia = async (file: StorageFile) => {

  const bucket = admin.storage().bucket(getStorageBucketName());
  const filePath = `${file.privacy}/${file.storagePath}`;
  const fileObject = bucket.file(filePath);

  const [exists] = await fileObject.exists();
  if (!exists) {
    console.log(`Delete Error : File "${filePath}" does not exists in the storage`);
  } else {

    // if the file has a jwPlayerId, we need to delete the video from JWPlayer's CDN
    // to avoid orphaned videos taking storage space
    if (file.jwPlayerId && file.jwPlayerId !== testVideoId) {
      const deleted = await deleteFromJWPlayer(file.jwPlayerId);
      if (!deleted.success) {
        logger.warn(`WARNING: file was delete from our system, but we failed to also delete it from JWPlayer! ${file}`);
      }
    }

    return fileObject.delete();
  }
}

function needsToBeCleaned(before: StorageFile | undefined, after: StorageFile | undefined) {
  return !!before?.storagePath && before.storagePath !== after?.storagePath;
};

function checkFileList(before: StorageFile[] | undefined, after: StorageFile[] | undefined) {
  const filesToClean: StorageFile[] = [];
  before?.forEach(beforeFile => {
    const existsInAfter = after?.some(afterFile => afterFile.storagePath === beforeFile.storagePath);
    if (!existsInAfter) filesToClean.push(beforeFile);
  });
  return filesToClean;
};

export async function cleanUserMedias(before: PublicUser, after?: PublicUser): Promise<unknown> {
  // Updating, check if avatar have been changed/removed
  const needUpdate = after && needsToBeCleaned(before.avatar, after.avatar);
  // Deleting
  const needDelete = !after && !!before.avatar;
  if (needUpdate || needDelete) {
    return deleteMedia(before.avatar);
  }
}

export async function cleanOrgMedias(before: OrganizationDocument, after?: OrganizationDocument): Promise<void> {
  const mediaToDelete: StorageFile[] = [];
  if (after) { // Updating
    if (needsToBeCleaned(before.logo, after.logo)) {
      mediaToDelete.push(before.logo);
    }

    if (!!before.documents && !!before.documents?.notes) {
      const notesToDelete = checkFileList(
        before.documents?.notes,
        after.documents?.notes
      );
      mediaToDelete.push(...notesToDelete);
    }

    const orgVideosToDelete = checkFileList(
      before.documents.videos,
      after.documents.videos
    );
    mediaToDelete.push(...orgVideosToDelete);

  } else { // Deleting
    if (before.logo) {
      mediaToDelete.push(before.logo);
    }

    if (before.documents?.notes.length) {
      before.documents.notes.forEach(n => mediaToDelete.push(n));
    }

    if (before.documents.videos?.length) {
      before.documents.videos.forEach(m => mediaToDelete.push(m));
    }
  }

  await Promise.all(mediaToDelete.map(m => deleteMedia(m)));
}

export async function cleanMovieMedias(before: MovieDocument, after?: MovieDocument): Promise<void> {

  const mediaToDelete: StorageFile[] = [];
  if (after) { // Updating

    // SINGLE FILE

    if (needsToBeCleaned(before.banner, after.banner)) {
      mediaToDelete.push(before.banner);
    }

    if (needsToBeCleaned(before.poster, after.poster)) {
      mediaToDelete.push(before.poster);
    }

    if (needsToBeCleaned(before.promotional.presentation_deck, after.promotional.presentation_deck)) {
      mediaToDelete.push(before.promotional.presentation_deck);
    }

    if (needsToBeCleaned(before.promotional.scenario, after.promotional.scenario)) {
      mediaToDelete.push(before.promotional.scenario);
    }

    if (needsToBeCleaned(before.promotional.moodboard, after.promotional.moodboard)) {
      mediaToDelete.push(before.promotional.moodboard);
    }

    if (needsToBeCleaned(before.promotional.videos?.screener, after.promotional.videos?.screener)) {
      mediaToDelete.push(before.promotional.videos.screener);
    }

    if (needsToBeCleaned(before.promotional.videos?.salesPitch, after.promotional.videos?.salesPitch)) {
      mediaToDelete.push(before.promotional.videos.salesPitch);
    }

    // FILES LIST

    const otherVideosToDelete = checkFileList(
      before.promotional.videos?.otherVideos,
      after.promotional.videos?.otherVideos
    );
    mediaToDelete.push(...otherVideosToDelete);

    const stillToDelete = checkFileList(
      before.promotional?.still_photo,
      after.promotional?.still_photo
    );
    mediaToDelete.push(...stillToDelete);

    const notesToDelete = checkFileList(
      before.promotional.notes,
      after.promotional.notes
    );
    mediaToDelete.push(...notesToDelete);


  } else { // Deleting

    if (before.banner) {
      mediaToDelete.push(before.banner);
    }

    if (before.poster) {
      mediaToDelete.push(before.poster);
    }

    if (before.promotional.presentation_deck) {
      mediaToDelete.push(before.promotional.presentation_deck);
    }

    if (before.promotional.scenario) {
      mediaToDelete.push(before.promotional.scenario);
    }

    if (before.promotional.moodboard) {
      mediaToDelete.push(before.promotional.moodboard);
    }

    if (before.promotional.videos?.screener?.storagePath) {
      mediaToDelete.push(before.promotional.videos.screener);
    }

    if (before.promotional.videos?.salesPitch?.storagePath) {
      mediaToDelete.push(before.promotional.videos.salesPitch);
    }

    if (before.promotional.videos?.otherVideos?.length) {
      before.promotional.videos.otherVideos.forEach(n => mediaToDelete.push(n));
    }

    if (before.promotional.still_photo?.length) {
      before.promotional.still_photo.forEach(photo => mediaToDelete.push(photo));
    }

    if (before.promotional.notes?.length) {
      before.promotional.notes.forEach(note => mediaToDelete.push(note));
    }
  }

  await Promise.all(mediaToDelete.map(m => deleteMedia(m)));

}

export const moveMedia = async (before: StorageFile, after: StorageFile) => {

  const bucket = admin.storage().bucket(getStorageBucketName());
  const beforePath = `${before.privacy}/${before.storagePath}`;
  const afterPath = `${after.privacy}/${after.storagePath}`;
  const fileObject = bucket.file(beforePath);

  const [exists] = await fileObject.exists();
  if (!exists) {
    logger.error(`Move Error : File "${beforePath}" does not exists in the storage`);
  } else {

    // set moving flag to prevent upload to jwPlayer
    await fileObject.setMetadata({
      metadata: {
        privacy: after.privacy,
        moving: 'true'
      }
    });
    return fileObject.move(afterPath);
  }
}

export async function moveMovieMedia(before: MovieDocument, after: MovieDocument): Promise<void> {

  const paths = [
    'promotional.videos.salesPitch',
    'promotional.videos.otherVideos'
  ];

  const containsFile = (file: StorageFile) => file && file.storagePath !== null;
  const needsToBeMoved = (beforeFile: StorageFile, afterFile: StorageFile) => {
    return containsFile(beforeFile)
        && containsFile(afterFile)
        && beforeFile.storagePath !== afterFile.storagePath;
  }

  for (const path of paths) {
    const beforeFile: StorageFile | StorageFile[] = getDeepValue(before, path);

    if (Array.isArray(beforeFile)) {
      before.promotional.videos.otherVideos?.forEach(beforeFile => {
        const afterFile = after.promotional.videos.otherVideos?.find(file => file.storagePath === beforeFile.storagePath);
        if (needsToBeMoved(beforeFile, afterFile)) {
          moveMedia(beforeFile, afterFile);
        }
      });

    } else {
      const afterFile: StorageFile = getDeepValue(after, path);
      if (needsToBeMoved(beforeFile, afterFile)) {
        moveMedia(beforeFile, afterFile);
      }
    }
  }
}