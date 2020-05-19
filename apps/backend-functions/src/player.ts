import { CallableContext } from 'firebase-functions/lib/providers/https';
import { EventDocument, EventMeta } from '@blockframes/event/+state/event.firestore';
import { isUserInvitedToScreening } from './internals/invitations/events';
import { MovieDocument } from './data/types';
import { jwplayerSecret } from './environments/environment';
import { createHash } from 'crypto';
import { firestore } from 'firebase'
import { getDocument } from './data/internals';
import { ErrorResultResponse } from './utils';

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

  if (event.isPrivate && !isUserInvitedToScreening(context.auth.uid, movie.id)){
    return {
      error: 'NO_INVITATION',
      result: `You have not been invited to see this movie`
    };
  }

  // TODO right now we are creating a link that expires at the end of the event
  // TODO we should discuss with François and Vincent of the best strategy for the expiring time of links
  // TODO issue#2653

  const toSign = `videos/${movie.hostedVideo}.mp4:${event.end.seconds}:${jwplayerSecret}`;
  const md5 = createHash('md5');

  const signature = md5.update(toSign).digest('hex');

  const signedUrl = `http://cdn.jwplayer.com/videos/${movie.hostedVideo}.mp4?exp=${event.end.seconds}&sig=${signature}`;

  return {
    error: '',
    result: signedUrl
  };
}
