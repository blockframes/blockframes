import { CallableContext } from 'firebase-functions/lib/providers/https';
import { db } from './internals/firebase';
import { EventDocument, EventMeta } from '@blockframes/event/+state/event.firestore';
import { isUserInvitedToScreening } from './internals/invitations/events';
import { MovieDocument } from './data/types';
import { jwplayerSecret } from './environments/environment';
import { createHash } from 'crypto';

// TODO issue#2643
// No typing
// const JWPlayerApi = require('jwplatform');

interface ReadVideoParams {
  eventId: string;
}

// TODO issue#2643
// interface UploadVideoParams {
//   fileName: string;
//   movieId: string;
// }

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

  const event = eventSnapshot.data()! as EventDocument<EventMeta>;

  if (event.type !== 'screening') {
    return {
      error: 'NOT_A_SCREENING',
      result: `The event ${data.eventId} is not a screening`
    };
  }

  const now = new Date();
  const end = event.end.toDate(); // we will need it bellow

  if (now < event.start.toDate()) {
    return {
      error: 'TOO_EARLY',
      result: `The event ${data.eventId} hasn't started yet`
    };
  }

  if (now > end) {
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

  const toSign = `videos/${movie.hostedVideo}.mp4:${end.getTime()}:${jwplayerSecret}`;
  const md5 = createHash('md5');

  const signature = md5.update(toSign).digest('hex');

  const signedUrl = `http://cdn.jwplayer.com/videos/${movie.hostedVideo}.mp4?exp=${end.getTime()}&sig=${signature}`;

  return {
    error: '',
    result: signedUrl
  };
}


// TODO this function is used to upload a video from Firebase storage to JWPlayer
// TODO The code should work fine but it throw a Google Cloud Billing related error
// TODO We are waiting for the Google support
// TODO With Vincent we decided to postpone this function as it can be done by hand at the beginning
// TODO see issue#2643

// export const uploadToJWPlayer = async (
//   data: UploadVideoParams,
//   context: CallableContext
// ): Promise<ErrorResultResponse> => {

//   if (!data.fileName) {
//     throw new Error(`No 'fileName' params, this parameter is mandatory !`);
//   }

  // if (!data.movieId) {
  //   throw new Error(`No 'movieId' params, this parameter is mandatory !`);
  // }

  // if (!context.auth) {
  //   throw new Error(`Unauthorized call !`);
  // }

  // TODO perform further check to see if user is authorized to upload a video for a given movie

  // const storage = admin.storage();
  // const videoFile = await storage.bucket('uploads').file(data.fileName);

  // const [exists] =  await videoFile.exists(); // this line throw an unexpected Error

  // if (!exists) {
    // return {
      // error: 'UNKOWN_FILE',
      // result: `There is no file stored with the name ${data.fileName}`
    // }
  // }

  // const expires = new Date().getTime() + 7200000; // now + 2 hours

  // const [videoUrl] = await videoFile.getSignedUrl({action: 'read', expires});
  // console.log('*** signed url', videoUrl);

  // const jw = new JWPlayerApi({apiKey: jwplayerKey, apiSecret: jwplayerSecret});
  // const result = await jw.videos.create({download_url: qsdzqdq});

  // return {
  //   error: '',
  //   result: 'OK'
  // }
// }
