import { CallableContext } from 'firebase-functions/lib/providers/https';
import { db, admin, getStorageBucketName } from './internals/firebase';
import { EventDocument, EventMeta, linkDuration } from '@blockframes/event/+state/event.firestore';
import { isUserInvitedToEvent } from './internals/invitations/events';
import { MovieDocument, OrganizationDocument, PublicUser } from './data/types';
import { jwplayerSecret, jwplayerKey } from './environments/environment';
import { createHash } from 'crypto';
import { firestore } from 'firebase'
import { getDocument } from './data/internals';
import { ErrorResultResponse } from './utils';
import { getDocAndPath, upsertWatermark } from '@blockframes/firebase-utils';
import { File as GFile } from '@google-cloud/storage';
import { User } from '@sentry/node';
import { HostedVideo } from '@blockframes/movie/+state/movie.firestore';
import { get } from 'lodash';

// No typing
const JWPlayerApi = require('jwplatform');

interface ReadVideoParams {
  eventId: string,
  jwPlayerId?: string;
  ref?: string;
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

  let jwPlayerId: string;

  // CHECK FOR A SCREENING
  if (event.type === 'screening') {

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

    if (!data.jwPlayerId) {
      // no jwPlayerId in request, we assume user want to see the main video (screener)
      if (!movie.promotional.videos?.screener?.jwPlayerId) {
        return {
          error: 'NO_VIDEO',
          result: `The requested screening doesn't exist on movie ${movie.id}`
        };
      } else {
        data.jwPlayerId = movie.promotional.videos?.screener?.jwPlayerId;
      }
    } else if (!isJwplayerIdBelongingToMovie(data.jwPlayerId, movie)) {
      return {
        error: 'NO_VIDEO',
        result: `The requested media doesn't exist on movie ${movie.id}`
      };
    }

    if (event.isPrivate && !isUserInvitedToEvent(context.auth.uid, movie.id)) {
      return {
        error: 'NO_INVITATION',
        result: `You have not been invited to see this movie`
      };
    }

    jwPlayerId = data.jwPlayerId;

  // CHECK FOR A MEETING
  } else {

    if (!data.ref) {
      return {
        error: 'NO_FILE',
        result: 'No file was provided in the ref parameter. ref is mandatory when the event is a meeting'
      }
    }

    const { filePath, doc, docData, fieldToUpdate } = await getDocAndPath(data.ref);

    const unauthorized: ErrorResultResponse = {
      error: 'UNAUTHORIZED',
      result: `You are not authorized to get the information of this video`
    };

    if (!isUserInvitedToEvent(context.auth.uid, data.eventId)) {

      // if the user is not invited, we should check if he has the right to see the file
      // aka if he belong of the org
      switch (doc.parent.id) {
        case 'orgs':
          const isAuthorizedInOrg = (docData as OrganizationDocument).userIds.some(userId => userId === context.auth?.uid);
          if (!isAuthorizedInOrg) {
            return unauthorized;
          }
          break;
        case 'movies':
          const creatorId = (docData as MovieDocument)._meta!.createdBy;
          const { orgId } = await getDocument<User>(`users/${creatorId}`);
          const org = await getDocument<OrganizationDocument>(`orgs/${orgId}`);
          const isAuthorizedInMovie = org.userIds.some(userId => userId === context.auth?.uid);
          if (!isAuthorizedInMovie) {
            return unauthorized;
          }
          break;
        default:
          return unauthorized;
      }
    }

    let savedRef: HostedVideo | HostedVideo[] | undefined = get(docData, fieldToUpdate);

    if (Array.isArray(savedRef)) {
      savedRef = savedRef.find(video => video.ref === filePath);
    }

    if (!savedRef || !savedRef.jwPlayerId) {
      return {
        error: 'DOCUMENT_VIDEO_NOT_FOUND',
        result: `The file ${data.ref} was pointing to the existing document (${doc.id}), but this document doesn't contain the file or it's not a video`
      }
    } else {
      jwPlayerId = savedRef.jwPlayerId;
    }
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

const isJwplayerIdBelongingToMovie = async (jwPlayerId: string, movie: MovieDocument) => {
  // jwPlayerId is the screener
  if (movie.promotional.videos?.screener?.jwPlayerId === jwPlayerId) {
    return true;
  }

  // jwPlayerId is in otherVideos array
  if (movie.promotional.videos?.otherVideos?.length) {
    return movie.promotional.videos.otherVideos.some(ov => ov.jwPlayerId === jwPlayerId);
  }

  // not found
  return false;
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
