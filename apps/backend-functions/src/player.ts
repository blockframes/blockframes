import { get } from 'lodash';
import { createHash } from 'crypto';
import { File as GFile } from '@google-cloud/storage';
import { CallableContext } from 'firebase-functions/v1/https';
import { jwplayerApiV2 } from '@blockframes/firebase-utils/jwplayer-api';
import { StorageVideo, linkDuration, ErrorResultResponse } from '@blockframes/model';
import { isAllowedToAccessMedia } from './internals/media';
import { jwplayerApiV2Secret, jwplayerSecret, production, e2eMode, jwplayer } from './environments/environment';
import { getDocument } from '@blockframes/firebase-utils';

export interface ReadVideoParams {

  /**
   * The reference to the video in storage
   */
  video: StorageVideo;

  /**
   * The id of the event.
   * Mandatory if the video is for a meeting.
   */
  eventId?: string,

  /**
   * The email of the user for 'protected' events
   */
  email?: string,
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

  const access = await isAllowedToAccessMedia(data.video, context.auth.uid, data.eventId, data.email);

  if (!access) {
    return {
      error: 'UNAUTHORIZED',
      result: `You are not authorized to see this video!`
    }
  }

  // extract trusted values
  const { collection, docId, field, jwPlayerId } = data.video;

  // retrieve not-trusted values
  const docData = await getDocument(`${collection}/${docId}`);
  const storageVideo: StorageVideo | StorageVideo[] | undefined = get(docData, field);
  if (Array.isArray(storageVideo)) {
    if (!storageVideo.some(video => video.jwPlayerId === jwPlayerId)) {
      return {
        error: 'DOCUMENT_VIDEO_NOT_FOUND',
        result: `The files in ${field} of document (${collection}/${docId}) have no matching jwPlayerId!`
      }
    }
  } else if (!storageVideo || !storageVideo.jwPlayerId) {
    return {
      error: 'DOCUMENT_VIDEO_NOT_FOUND',
      result: `The file ${field} of document (${collection}/${docId}) has no jwPlayerId!`
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
  try {
    // FETCH VIDEO METADATA
    const info = await jwplayerApiV2(jwplayer.propertyId, jwplayerApiV2Secret).getVideoInfo(jwPlayerId);

    return {
      error: '',
      result: { signedUrl, info }
    };
  } catch (error: unknown) {
    return {
      error: '',
      result: {
        signedUrl,
        info: { duration: 0 },
      }
    };
  }

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

  if (e2eMode) return { success: true, key: jwplayer.testVideoId };

  const expires = new Date().getTime() + 7200000; // now + 2 hours

  const [videoUrl] = await file.getSignedUrl({ action: 'read', expires });
  const tag = production ? 'production' : 'test';

  try {
    const result = await jwplayerApiV2(jwplayer.propertyId, jwplayerApiV2Secret).createVideo(videoUrl, tag);

    return { success: true, key: result.id };
  } catch (error: unknown) {
    return { success: false, message: 'UPLOAD FAILED' };
  }
}


export const deleteFromJWPlayer = async (jwPlayerId: string) => {

  try {
    const result = await jwplayerApiV2(jwplayer.propertyId, jwplayerApiV2Secret).deleteVideo(jwPlayerId);

    return { success: true, keys: result };
  } catch (error: unknown) {
    return { success: false, message: `DELETE FAILED, please delete ${jwPlayerId} manually` };
  }
};


export const getPlayerUrl = async (
  _: unknown,
  context: CallableContext
): Promise<string> => {
  if (!context.auth) {
    throw new Error(`Unauthorized call !`);
  }

  const expires = Math.floor(new Date().getTime() / 1000) + linkDuration; // now + 5 hours

  const toSign = `libraries/${jwplayer.playerId}.js:${expires}:${jwplayerSecret}`;
  const md5 = createHash('md5');

  const signature = md5.update(toSign).digest('hex');

  const signedUrl = `https://cdn.jwplayer.com/libraries/${jwplayer.playerId}.js?exp=${expires}&sig=${signature}`;
  return signedUrl;
};
