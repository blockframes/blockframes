import { CallableContext } from 'firebase-functions/lib/providers/https';
import { db, getStorageBucketName } from './internals/firebase';
import * as admin from 'firebase-admin';
import { EventDocument, EventMeta, linkDuration } from '@blockframes/event/+state/event.firestore';
import { isUserInvitedToEvent } from './internals/invitations/events';
import { PublicUser } from './data/types';
import { jwplayerSecret, jwplayerKey } from './environments/environment';
import { createHash } from 'crypto';
import { firestore } from 'firebase'
import { getDocument, getOrganizationsOfMovie } from './data/internals';
import { ErrorResultResponse } from './utils';
import { getDocAndPath, upsertWatermark } from '@blockframes/firebase-utils';
import { File as GFile } from '@google-cloud/storage';
import { HostedVideo } from '@blockframes/movie/+state/movie.firestore';
import { get } from 'lodash';

// No typing
const JWPlayerApi = require('jwplatform');

interface ReadVideoParams {

  /**
   * The reference to the video in storage
   */
  ref: string;

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

  if (!data.ref) {
    return {
      error: 'UNKNOWN_REFERENCE',
      result: 'No reference in params, this parameter is mandatory !'
    }
  }

  const uid = context.auth.uid;
  const { privacy, collection, doc, docData, field } = await getDocAndPath(data.ref);

  if (!docData) {
    return {
      error: 'UNKNOWN_DOCUMENT',
      result: 'The reference points to an unknown document'
    }
  }

  let access = privacy === 'public';

  if (!access && privacy === 'protected') {

    // CHECK FOR ORGANIZATION MEMBER
    if (collection === 'movies') {
      const orgs = await getOrganizationsOfMovie(doc.id);
      access = orgs
        .filter(org => !!org && !!org.userIds)
        .some(org => org.userIds.some(userId => userId === uid));
    }

    // CHECK FOR EVENT MEMBER
    if (!access && data.eventId) {
      const event = await getDocument<EventDocument<EventMeta>>(`events/${data.eventId}`);
    
      if (!event) {
        return {
          error: 'UNKNOWN_EVENT',
          result: `There is no event with the ID ${data.eventId}`
        };
      }
    
      if (event.type !== 'screening' && event.type !== 'meeting') {
        return {
          error: 'WRONG_EVENT_TYPE',
          result: `The event ${data.eventId} is a ${event.type} but only 'screening' & 'meeting' are supported.`
        };
      }
    
      const now = firestore.Timestamp.now();
    
      if (now.seconds < event.start.seconds) {
        return {
          error: 'TOO_EARLY',
          result: `The event ${data.eventId} hasn't started yet`
        };
      }
    
      if (now.seconds > event.end.seconds) {
        return {
          error: 'TOO_LATE',
          result: `The event ${data.eventId} is finished`
        };
      }

      // CHECK FOR A SCREENING
      if (event.type === 'screening') {

        if (!('titleId' in event.meta)) {
          throw new Error(`Event ${data.eventId} is a screening but doesn't have a 'titleId' !`);
        }

        if (event.isPrivate && !await isUserInvitedToEvent(uid, data.eventId)) {
          return {
            error: 'NO_INVITATION',
            result: `You have not been invited to see this movie`
          };
        }

      // CHECK FOR A MEETING
      } else {

        if (!await isUserInvitedToEvent(uid, data.eventId)) {
          return {
            error: 'UNAUTHORIZED',
            result: `You are not authorized to get the information of this video`
          }
        }
      }

      access = true;
    }
  }

  if (!access) {
    return {
      error: 'UNAUTHORIZED',
      result: `You are not authorized to see this video`
    }
  }

  // get JwPlayerId
  let savedRef: HostedVideo | HostedVideo[] | undefined = get(docData, field)
  if (Array.isArray(savedRef)) {
    savedRef = savedRef.find(video => video.ref === data.ref);
  }

  if (!savedRef || !savedRef.jwPlayerId) {
    return {
      error: 'DOCUMENT_VIDEO_NOT_FOUND',
      result: `The file ${data.ref} was pointing to the existing document (${doc.id}), but this document doesn't contain the file or it's not a video`
    }
  }
  
  const jwPlayerId = savedRef.jwPlayerId

  // watermark fallback : in case the user's watermark doesn't exist we generate it
  const userRef = db.collection('users').doc(uid);
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
  const result = await jw.videos.create({ download_url: videoUrl }).catch(e => ({ status: 'error', message: e.message }));

  if (result.status === 'error' || !result.video || !result.video.key) {
    return { success: false, message: result.message || '' }
  } else {
    return { success: true, key: result.video.key }
  }
}
