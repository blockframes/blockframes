import { CallableContext } from 'firebase-functions/lib/providers/https';
import { db, admin } from './internals/firebase';
import { EventDocument, EventMeta } from '@blockframes/event/+state/event.firestore';
import { isUserInvitedToScreening } from './internals/invitations/events';
import { MovieDocument } from './data/types';
import { jwplayerSecret, jwplayerKey } from './environments/environment';
import { createHash } from 'crypto';
import { firestore } from 'firebase'

// No typing
const JWPlayerApi = require('jwplatform');

interface ReadVideoParams {
  eventId: string;
}

interface UploadVideoParams {
  fileName: string;
  movieId: string;
}

interface ErrorResultResponse {
  error: string;
  result: any;
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

  const eventSnapshot = await db.collection('events').doc(data.eventId).get();

  if (!eventSnapshot.exists) {
    return {
      error: 'UNKNOWN_EVENT',
      result: `There is no event with the ID ${data.eventId}`
    };
  }

  const event = eventSnapshot.data() as EventDocument<EventMeta>;

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

  const movieSnapshot = await db.collection('movies').doc(event.meta.titleId).get();

  if (!movieSnapshot.exists) {
    return {
      error: 'UNKNOWN_MOVIE',
      result: `The event ${data.eventId} is about an unknown movie`
    };
  }

  const movie = movieSnapshot.data() as MovieDocument;

  if (!movie.hostedVideo) {
    return {
      error: 'NO_VIDEO',
      result: `The creator of the movie hasn't uploaded any video for you to watch`
    };
  }

  if (event.isPrivate && !isUserInvitedToScreening(context.auth.uid, movie.id)){
    return {
      error: 'NO_INVITATION',
      result: `You have not been invited to see this movie`
    };
  }

  // TODO right now we are creating a link that expires at the end of the event
  // TODO we should discuss with François and Vincent of the best strategy for the expiring time of links

  const toSign = `videos/${movie.hostedVideo}.mp4:${event.end.seconds}:${jwplayerSecret}`;
  const md5 = createHash('md5');

  const signature = md5.update(toSign).digest('hex');

  const signedUrl = `http://cdn.jwplayer.com/videos/${movie.hostedVideo}.mp4?exp=${event.end.seconds}&sig=${signature}`;

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

  const storage = admin.storage();
  const videoFile = await storage.bucket().file(`uploads/${data.fileName}`);
  const [exists] =  await videoFile.exists(); // this line throw an unexpected Error

  if (!exists) {
    return {
      error: 'UNKOWN_FILE',
      result: `There is no file stored with the name ${data.fileName}`
    }
  }

  // it's better to use Date here instead of firestore.Timestamp since
  // this value will be fed back to 'new Date()' inside the Google system
  // using firestore.Timestamp was causing error about the date being in the past
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
