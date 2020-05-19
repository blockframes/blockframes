import { ErrorResultResponse } from '@blockframes/utils/utils';
import { db, admin, functions } from './firebase';
import { jwplayerSecret, jwplayerKey } from '../environments/environment';

type ObjectMetadata = functions.storage.ObjectMetadata;

// No typing
const JWPlayerApi = require('jwplatform');


export async function uploadToJWPlayer(data: ObjectMetadata): Promise<ErrorResultResponse> {

  const filePath = data.name;

  if (filePath === undefined) {
    throw new Error('undefined data.name!');
  }

  const filePathElements = filePath.split('/')

  if (filePathElements.length !== 4) {
    throw new Error('unhandled filePath:' + filePath);
  }

  // [collection, movieId, fieldToUpdate, fileName] = filePathElements;
  const movieId = filePathElements[1];
  const fileName = filePathElements[4];

  // here we need the ref (instead of getDocument) because we will update the movie bellow
  const movieRef = db.collection('movies').doc(movieId);
  const movieSnap = await movieRef.get();

  if (!movieSnap.exists){
    return {
      error: 'UNKNOWN_MOVIE',
      result: `There is no movie with id ${movieId}`
    }
  }

  const storage = admin.storage();
  const videoFile = await storage.bucket().file(`uploads/${fileName}`);
  const [exists] =  await videoFile.exists();

  if (!exists) {
    return {
      error: 'UNKNOWN_FILE',
      result: `There is no file stored with the name ${fileName}`
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
