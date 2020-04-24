import { CallableContext } from 'firebase-functions/lib/providers/https';
import { db } from './internals/firebase';
import { EventDocument, EventMeta } from '@blockframes/event/+state/event.firestore';
import { isUserInvitedToScreening } from './internals/invitations/events';
import { MovieDocument } from './data/types';
import { jwplayerSecret } from './environments/environment';
import { createHash } from 'crypto';

interface Params {
  eventId: string;
}

export const getPrivateVideoUrl = async (
  data: Params,
  context: CallableContext
): Promise<any> => {


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
