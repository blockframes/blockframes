
// External dependencies
import { createHash } from 'crypto';
import { get, set } from 'lodash';
import { logger, storage } from 'firebase-functions';
import { CallableContext } from 'firebase-functions/lib/providers/https';

// Blockframes dependencies
import {
  FileMetaData,
  isValidMetadata,
  StorageFile,
  PublicUser,
  User,
  Movie,
  Organization,
  MovieVideos,
  ScreenerType,
  Waterfall,
  WaterfallDocument,
  WaterfallPermissions
} from '@blockframes/model';
import { tempUploadDir } from '@blockframes/utils/file-sanitizer';
import { ImageParameters, formatParameters } from '@blockframes/media/image/directives/imgix-helpers';

// Internal dependencies
import { deleteFromJWPlayer, uploadToJWPlayer } from './player';
import { imgixToken, storageBucket, jwplayer } from './environments/environment';
import { db } from './internals/firebase';
import { isAllowedToAccessMedia } from './internals/media';
import { getDeepValue } from './internals/utils';
import { getDocument, getDocumentSnap, getStorage } from '@blockframes/firebase-utils';
import { triggerError } from './internals/sentry';


/**
 * This function is executed on every files uploaded on the tmp directory of the storage.
 * It check if a new file in tmp directory is already referenced on DB and move it to correct folder
 */
export async function linkFile(data: storage.ObjectMetadata) {

  if (!data.name) return false;

  const bucket = getStorage().bucket(storageBucket);
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
            const userSnap = await getDocumentSnap(`users/${uploaderUid}`);
            await assertFile(userSnap.exists, notAllowedError);

            const movieSnap = await getDocumentSnap(`movies/${metadata.docId}`);
            await assertFile(movieSnap.exists, notAllowedError);

            const [user, movie] = await Promise.all([
              getDocument<User>(`users/${uploaderUid}`),
              getDocument<Movie>(`movies/${metadata.docId}`)
            ]);

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
          case 'waterfall': {

            // only waterfall members can upload 
            const userRef = db.collection('users').doc(uploaderUid);
            const userSnap = await transaction.get(userRef);
            await assertFile(userSnap.exists, notAllowedError);

            const waterfallSnap = await getDocumentSnap(`waterfall/${metadata.docId}`);
            await assertFile(waterfallSnap.exists, notAllowedError);

            const [user, waterfall] = await Promise.all([
              getDocument<User>(`users/${uploaderUid}`),
              getDocument<Waterfall>(`waterfall/${metadata.docId}`)
            ]);

            const isAllowed = waterfall.orgIds.some(orgId => orgId === user.orgId);
            await assertFile(isAllowed, notAllowedError);

            // use metadata.id to get subCollection document and user.orgId to get permissions
            const [subDocumentSnap, permissionsDoc] = await Promise.all([
              getDocumentSnap(`waterfall/${metadata.docId}/documents/${metadata.id}`),
              getDocument<WaterfallPermissions>(`waterfall/${metadata.docId}/permissions/${user.orgId}`)
            ]);

            if (subDocumentSnap.exists) {
              // check if user is allowed to update already existing WaterfallDocument
              const document = userSnap.data() as WaterfallDocument;
              await assertFile(user.orgId === document.ownerId || permissionsDoc.roles.includes('producer'), notAllowedError);
            } else {
              // TODO #9389 init WaterfallDocument with ownerId = user.orgId
            }

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

      // (3) if video file, upload to jwPlayer
      const isVideo = data.contentType.indexOf('video/') === 0 && ['movies', 'orgs'].includes(metadata.collection);
      if (isVideo) {
        const uploadResult = await uploadToJWPlayer(to);

        // There was an error when uploading file to jwPlayer
        if (!uploadResult.success || !uploadResult.key) {
          const message = `Upload to JwPlayer failed for video ${data.name}. ${metadata.collection}/${metadata.docId}`;
          await triggerError({ message, bugType: 'jwplayer-api' });
          console.error(message);
          if (uploadResult.message) {
            console.error(`An error occurred when uploading video to JwPlayer: ${uploadResult.message}`);
          }
        } else {
          metadata.jwPlayerId = uploadResult.key;
        }
      }

      // (4) update db

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

      const fileLists = [
        'documents.notes',
        'documents.videos',
        'promotional.still_photo',
        'promotional.notes',

        // TODO #9389
        'documents',
      ];
      const isList = fileLists.includes(metadata.field);

      if (fieldValue === undefined && isList) {
        fieldValue = [uploadData];
      } else if (Array.isArray(fieldValue)) {
        if (uploadData.id) fieldValue = fieldValue.filter(f => f.id !== uploadData.id);
        fieldValue.push(uploadData);
      } else {
        fieldValue = uploadData;
      }

      set(doc, metadata.field, fieldValue);

      await transaction.update(docRef, doc);
    }).catch(err => console.error('Transaction Failed:', err));

    // (5) delete tmp/file
    return file.delete();

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

const deleteMedia = async (file: StorageFile) => {

  const bucket = getStorage().bucket(storageBucket);
  const filePath = `${file.privacy}/${file.storagePath}`;
  const fileObject = bucket.file(filePath);

  const [exists] = await fileObject.exists();
  if (!exists) {
    console.log(`Delete Error : File "${filePath}" does not exists in the storage`);
  } else {

    // if the file has a jwPlayerId, we need to delete the video from JWPlayer's CDN
    // to avoid orphaned videos taking storage space
    if (file.jwPlayerId && file.jwPlayerId !== jwplayer.testVideoId) {
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

function needsToCleanScreener(videosBefore: Partial<MovieVideos> = {}, videosAfter: Partial<MovieVideos> = {}, type: ScreenerType) {
  const otherType: ScreenerType = type === 'screener' ? 'publicScreener' : 'screener';

  // PublicScreener was copied to screener or vice versa
  if (!!videosBefore[type]?.storagePath && videosAfter[otherType]?.storagePath && videosBefore[type].storagePath === videosAfter[otherType].storagePath) return false;

  return needsToBeCleaned(videosBefore[type], videosAfter[type]);
}

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

export async function cleanOrgMedias(before: Organization, after?: Organization): Promise<void> {
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

export async function cleanMovieMedias(before: Movie, after?: Movie): Promise<void> {

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

    if (needsToCleanScreener(before.promotional.videos, after.promotional.videos, 'screener')) {
      mediaToDelete.push(before.promotional.videos.screener);
    }

    if (needsToCleanScreener(before.promotional.videos, after.promotional.videos, 'publicScreener')) {
      mediaToDelete.push(before.promotional.videos.publicScreener);
    }

    if (needsToBeCleaned(before.promotional.videos?.salesPitch, after.promotional.videos?.salesPitch)) {
      mediaToDelete.push(before.promotional.videos.salesPitch);
    }

    if (needsToBeCleaned(before.promotional.videos?.otherVideo, after.promotional.videos?.otherVideo)) {
      mediaToDelete.push(before.promotional.videos.otherVideo);
    }

    // FILES LIST

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

    if (before.promotional.videos?.publicScreener?.storagePath) {
      mediaToDelete.push(before.promotional.videos.publicScreener);
    }

    if (before.promotional.videos?.salesPitch?.storagePath) {
      mediaToDelete.push(before.promotional.videos.salesPitch);
    }

    if (before.promotional.videos?.otherVideo?.storagePath) {
      mediaToDelete.push(before.promotional.videos.otherVideo);
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

const moveMedia = async (before: StorageFile, after: StorageFile) => {

  const bucket = getStorage().bucket(storageBucket);
  const beforePath = `${before.privacy}/${before.storagePath}`;
  const afterPath = `${after.privacy}/${after.storagePath}`;
  const fileObject = bucket.file(beforePath);

  const [exists] = await fileObject.exists();
  if (!exists) {
    logger.error(`Move Error : File "${beforePath}" does not exists in the storage`);
  } else {

    // update meta data with new privacy
    await fileObject.setMetadata({ metadata: { privacy: after.privacy } });
    return fileObject.move(afterPath);
  }
}

/**
 * Moves a video when privacy change
 * @param before 
 * @param after 
 */
export async function moveMovieMedia(before: Movie, after: Movie): Promise<void> {

  // Videos upload types where privacy can be changed
  const paths = [
    'promotional.videos.salesPitch',
    'promotional.videos.otherVideo'
  ];

  const containsFile = (file: StorageFile) => file && file.storagePath !== null;
  const needsToBeMoved = (beforeFile: StorageFile, afterFile: StorageFile) => {
    return containsFile(beforeFile)
      && containsFile(afterFile)
      && beforeFile.privacy !== afterFile.privacy;
  }

  for (const path of paths) {
    const beforeFiles: StorageFile = getDeepValue(before, path);
    const afterFile: StorageFile = getDeepValue(after, path);
    if (needsToBeMoved(beforeFiles, afterFile)) {
      await moveMedia(beforeFiles, afterFile);
    }
  }
}
