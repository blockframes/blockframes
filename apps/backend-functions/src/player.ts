import { CallableContext } from 'firebase-functions/lib/providers/https';
import { db, admin, getStorageBucketName } from './internals/firebase';
import { EventDocument, EventMeta, linkDuration } from '@blockframes/event/+state/event.firestore';
import { isUserInvitedToScreening } from './internals/invitations/events';
import { MovieDocument, PublicUser } from './data/types';
import { jwplayerSecret, jwplayerKey } from './environments/environment';
import { createHash } from 'crypto';
import { firestore } from 'firebase'
import { getDocument } from './data/internals';
import { ErrorResultResponse } from './utils';
import { upsertWatermark } from '@blockframes/firebase-utils';
import { File as GFile } from '@google-cloud/storage';

// No typing
const JWPlayerApi = require('jwplatform');

interface ReadVideoParams {
  eventId: string;
}

export const getPrivateVideoUrl = async (
  data: ReadVideoParams,
  context: CallableContext
): Promise<ErrorResultResponse> => {


  if (!data.eventId) {
    throw new Error(`No 'eventId' params, this parameter is mandatory !`);
  }

  if (!context.auth) {
    throw new Error(`Unauthorized call !`);
  }

  const event = await getDocument<EventDocument<EventMeta>>(`events/${data.eventId}`);

  if (!event) {
    return {
      error: 'UNKNOWN_EVENT',
      result: `There is no event with the ID ${data.eventId}`
    };
  }

  if (event.type !== 'screening') {
    return {
      error: 'NOT_A_SCREENING',
      result: `The event ${data.eventId} is not a screening`
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

  if (!('titleId' in event.meta)) {
    throw new Error(`Event ${data.eventId} is a screening but doesn't have a 'titleId' !`);
  }

  const movie = await getDocument<MovieDocument>(`movies/${event.meta.titleId}`);

  if (!movie) {
    return {
      error: 'UNKNOWN_MOVIE',
      result: `The event ${data.eventId} is about an unknown movie`
    };
  }

  if (!movie.hostedVideo) {
    return {
      error: 'NO_VIDEO',
      result: `The creator of the movie hasn't uploaded any video for you to watch`
    };
  }

  if (event.isPrivate && !isUserInvitedToScreening(context.auth.uid, movie.id)) {
    return {
      error: 'NO_INVITATION',
      result: `You have not been invited to see this movie`
    };
  }

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

  // we need expiry date in UNIX Timestamp (aka seconds), JS Date give use milliseconds,
  // so we need to divide by 1000 to get back seconds
  // we then add the duration in seconds to get the final expiry date
  const expires = Math.floor(new Date().getTime() / 1000) + linkDuration; // now + 5 hours

  const toSign = `manifests/${movie.hostedVideo}.m3u8:${expires}:${jwplayerSecret}`;
  const md5 = createHash('md5');

  const signature = md5.update(toSign).digest('hex');

  const signedUrl = `https://cdn.jwplayer.com/manifests/${movie.hostedVideo}.m3u8?exp=${expires}&sig=${signature}`;

  return {
    error: '',
    result: signedUrl
  };
}

/**
 * 
 * @param file 
 * @see https://developer.jwplayer.com/jwplayer/docs/authentication
 * @see https://developer.jwplayer.com/jwplayer/reference#post_videos-create
 * @see https://developer.jwplayer.com/jwplayer/docs/upload-videos-with-a-resumable-protocol
 * 
 */
export const uploadToJWPlayer = async (file: GFile): Promise<{ status: boolean, key?: string, message?: string }> => {

  const expires = new Date().getTime() + 7200000; // now + 2 hours

  const [videoUrl] = await file.getSignedUrl({ action: 'read', expires });

  const jw = new JWPlayerApi({ apiKey: jwplayerKey, apiSecret: jwplayerSecret });
  const result = await jw.videos.create({ download_url: videoUrl }).catch(e => ({ status: 'error', message: e.message }));

  if (result.status === 'error' || !result.video || !result.video.key) {
    return { status: false, message: result.message || '' }
  } else {
    return { status: true, key: result.video.key }
  }
}
