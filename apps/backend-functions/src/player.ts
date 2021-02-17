
import { get } from 'lodash';
import { createHash } from 'crypto';
import * as admin from 'firebase-admin';
import { File as GFile } from '@google-cloud/storage';
import { CallableContext } from 'firebase-functions/lib/providers/https';

import { upsertWatermark } from '@blockframes/firebase-utils';
import { linkDuration } from '@blockframes/event/+state/event.firestore';
import { StorageVideo } from '@blockframes/media/+state/media.firestore';

import { PublicUser } from './data/types';
import { ErrorResultResponse } from './utils';
import { getDocument } from './data/internals';
import { isAllowedToAccessMedia } from './media';
import { db, getStorageBucketName } from './internals/firebase';
import { jwplayerSecret, jwplayerKey, enableDailyFirestoreBackup } from './environments/environment';


// No typing
const JWPlayerApi = require('jwplatform');

interface ReadVideoParams {

  /**
   * The reference to the video in storage
   */
  video: StorageVideo;

  /**
   * The id of the event.
   * Mandatory if the video is for a meeting.
   */
  eventId?: string,
}

export const getPrivateVideoUrl = async (
  data: ReadVideoParams,
  context: CallableContext
): Promise<ErrorResultResponse> => {

  if (!context.auth) {
    throw new Error(`Unauthorized call !`);
  }

  if (!data.video) {
    return {
      error: 'UNKNOWN_VIDEO',
      result: 'No video in params, this parameter is mandatory!'
    }
  }

  const access = await isAllowedToAccessMedia(data.video, context.auth.uid, data.eventId);

  if (!access) {
    return {
      error: 'UNAUTHORIZED',
      result: `You are not authorized to see this video!`
    }
  }

  // extract trusted values
  const { collection, docId, field } = data.video;

  // retrieve not-trusted values
  const docData = await getDocument(`${collection}/${docId}`);
  const storageVideo: StorageVideo | undefined = get(docData, field);
  if (!storageVideo || !storageVideo.jwPlayerId) {
    return {
      error: 'DOCUMENT_VIDEO_NOT_FOUND',
      result: `The file ${field} of document (${collection}/${docId}) has no jwPlayerId!`
    }
  }
  const { jwPlayerId } = storageVideo;


  // watermark fallback : in case the user's watermark doesn't exist we generate it
  const userRef = db.collection('users').doc(context.auth.uid);
  const userSnap = await userRef.get();
  const user = userSnap.data() as PublicUser;

  const bucketName = getStorageBucketName();

  let fileExists = false;

  // if we have a ref we should assert that it points to an existing file
  if (!!user.watermark) {
    const ref = `public/users/${user.uid}/watermark/${user.uid}.svg`;
    const file = admin.storage().bucket(bucketName).file(ref);
    [fileExists] = await file.exists();
  }

  // if we don't have a ref OR if the file doesn't exists : we regenerate the Watermark
  if (!user.watermark || !fileExists) {

    upsertWatermark(user, bucketName);

    // wait for the function to update the user document after watermark creation
    const success = await new Promise(resolve => {

      const unsubscribe = userRef.onSnapshot(snap => {
        const userData = snap.data() as PublicUser;

        if (!!userData.watermark) {
          unsubscribe();
          resolve(true);
        }
      });

      // timeout after 10s
      setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, 10000);
    });

    if (!success) {
      return {
        error: 'WATERMARK_CREATION_TIMEOUT',
        result: `The watermark creation has timeout, please try again later`
      };
    }
  }

  //GENERATE THE VIDEO ACCESS URL

  // we need expiry date in UNIX Timestamp (aka seconds), JS Date give use milliseconds,
  // so we need to divide by 1000 to get back seconds
  // we then add the duration in seconds to get the final expiry date
  const expires = Math.floor(new Date().getTime() / 1000) + linkDuration; // now + 5 hours

  const toSign = `manifests/${jwPlayerId}.m3u8:${expires}:${jwplayerSecret}`;
  const md5 = createHash('md5');

  const signature = md5.update(toSign).digest('hex');

  const signedUrl = `https://cdn.jwplayer.com/manifests/${jwPlayerId}.m3u8?exp=${expires}&sig=${signature}`;

  // FETCH VIDEO METADATA
  const jw = new JWPlayerApi({apiKey: jwplayerKey, apiSecret: jwplayerSecret});
  const response = await jw.videos.show({video_key: jwPlayerId});

  let info: any;
  if (response.status === 'ok') {
    info = response.video;
  }

  return {
    error: '',
    result: {
      signedUrl,
      info
    }
  };
}


/**
 * Use this function to tell JWPlayer's server to download a video file from our storage.
 * @param file a Google Cloud File object
 * @see https://developer.jwplayer.com/jwplayer/docs/authentication
 * @see https://developer.jwplayer.com/jwplayer/reference#post_videos-create
 * @see https://developer.jwplayer.com/jwplayer/docs/upload-videos-with-a-resumable-protocol
 *
 */
export const uploadToJWPlayer = async (file: GFile): Promise<{
  /** signal the upload success/failure */
  success: boolean,
  /** if upload is a success (`success = true`) this field will hold the new JWPlayer video id */
  key?: string,
  /** if upload is a failure (`success = false`) this field will hold the error message */
  message?: string
}> => {

  const expires = new Date().getTime() + 7200000; // now + 2 hours

  const [videoUrl] = await file.getSignedUrl({ action: 'read', expires });

  const jw = new JWPlayerApi({ apiKey: jwplayerKey, apiSecret: jwplayerSecret });
  const tags = enableDailyFirestoreBackup ? 'production' : 'test';
  const result = await jw.videos.create({ download_url: videoUrl, tags }).catch(e => ({ status: 'error', message: e.message }));

  if (result.status === 'error' || !result.video || !result.video.key) {
    return { success: false, message: result.message || '' }
  } else {
    return { success: true, key: result.video.key }
  }
}
