import { CallableContext } from 'firebase-functions/lib/providers/https';
import { db, admin } from './internals/firebase';
import { EventDocument, EventMeta, linkDuration } from '@blockframes/event/+state/event.firestore';
import { isUserInvitedToMeetingOrScreening } from './internals/invitations/events';
import { MovieDocument } from './data/types';
import { jwplayerSecret, jwplayerKey } from './environments/environment';
import { createHash } from 'crypto';
import { firestore } from 'firebase'
import { getDocument } from './data/internals';
import { ErrorResultResponse } from './utils';

// No typing
const JWPlayerApi = require('jwplatform');

interface ReadVideoParams {
  eventId: string;
}

interface UploadVideoParams {
  fileName: string;
  movieId: string;
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

  if (event.isPrivate && !isUserInvitedToMeetingOrScreening(context.auth.uid, movie.id)){
    return {
      error: 'NO_INVITATION',
      result: `You have not been invited to see this movie`
    };
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

export const uploadToJWPlayer = async (
  data: UploadVideoParams,
  context: CallableContext
): Promise<ErrorResultResponse> => {

  if (!data.fileName) {
    throw new Error(`No 'fileName' params, this parameter is mandatory !`);
  }

  if (!data.movieId) {
    throw new Error(`No 'movieId' params, this parameter is mandatory !`);
  }

  // here we need the ref (instead of getDocument) because we will update the movie bellow
  const movieRef = db.collection('movies').doc(data.movieId);
  const movieSnap = await movieRef.get();

  if (!movieSnap.exists){
    return {
      error: 'UNKOWN_MOVIE',
      result: `There is no movie with id ${data.movieId}`
    }
  }

  if (!context.auth) {
    throw new Error(`Unauthorized call !`);
  }

  // TODO perform further check to see if user is authorized to upload a video for a given movie
  // TODO issue#2653

  const storage = admin.storage();
  const videoFile = await storage.bucket().file(`uploads/${data.fileName}`);
  const [exists] =  await videoFile.exists();

  if (!exists) {
    return {
      error: 'UNKOWN_FILE',
      result: `There is no file stored with the name ${data.fileName}`
    }
  }

  // * This duration (2 hours) is different than the video url duration above
  // * This is only the time we give to the JWPlayer server
  // * to download the movie from our firebase storage
  // it's better to use Date here instead of firestore.Timestamp since
  // this value will be fed back to 'new Date()' inside the Google system,
  // using firestore.Timestamp was causing an error about the date being in the past
  const expires = new Date().getTime() + 7200000; // now + 2 hours

  const [videoUrl] = await videoFile.getSignedUrl({action: 'read', expires});

  const jw = new JWPlayerApi({apiKey: jwplayerKey, apiSecret: jwplayerSecret});
  const result = await jw.videos.create({download_url: videoUrl});

  if (result.status === 'error' || !result.video || !result.video.key) {
    return {
      error: 'JWPLAYER-ERROR',
      result: result
    }
  }

  await movieRef.update({hostedVideo: result.video.key});

  return {
    error: '',
    result: 'OK'
  }
}
