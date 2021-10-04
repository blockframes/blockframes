
import { Movie } from '@blockframes/movie/+state';
import { getCollection, jwplayerApiV2 } from '@blockframes/firebase-utils';
import { MovieVideo } from '@blockframes/movie/+state/movie.firestore';
import { StorageVideo } from '@blockframes/media/+state/media.firestore';
import { delay } from '@blockframes/utils/helpers';
import { storageFileExist } from 'libs/firebase-utils/src/lib/firebase-utils';


type StorageVideoKeys = keyof StorageVideo;

const keysToCheck: StorageVideoKeys[] = [
  'jwPlayerId',
  'privacy',
  'collection',
  'docId',
  'field',
  'storagePath'
];

function isVideoOK(video: StorageVideo) {
  return keysToCheck.every(key => !!video[key]);
}

function checkStorageFile(video: StorageVideo) {
  const filePath = `/${video.privacy}/${video.storagePath}`;
  return storageFileExist(filePath);
}

async function checkJWP(jwplayerKey: string, jwplayerApiV2Secret: string, videoId: string) {
  const api = jwplayerApiV2(jwplayerKey, jwplayerApiV2Secret);

  // if we send empty string '' it will list all videos
  const info = await api.getVideoInfo(videoId ?? 'thisIdDoesNotExist');
  if (info.status === 'ready') return true;
  return false;
}

/** Check for video that exists in the storage but NOT in JWP */
function isMissingJW(video: StorageVideo) {
  return (!video.jwPlayerId && !!video.storagePath);
}

/** Check for video that exists in JWP but NOT in the storage */
function isMissingStorage(video: StorageVideo) {
  return (!!video.jwPlayerId && !video.storagePath);
}

export async function rescueJWP(options: {jwplayerKey: string, jwplayerApiV2Secret: string}) {

  const { jwplayerKey, jwplayerApiV2Secret } = options;

  if (!jwplayerKey) {
    console.log('\nMISSING JWPLAYER KEY ! you should pass it as the 1st argument');
    console.log('\ncommand syntax :\n\tnpm run backend-ops rescueJWP <JWP-KEY> <JPW-API-V2-SECRET>\n');
    return;
  }

  if (!jwplayerApiV2Secret) {
    console.log('\nMISSING JWPLAYER API V2 SECRET ! you should pass it as the 2nd argument');
    console.log('\ncommand syntax :\n\tnpm run backend-ops rescueJWP <JWP-KEY> <JPW-API-V2-SECRET>\n');
    return;
  }

  // 1) Get all videos in DB
  //  - Movies
  //    - promotional.videos.salesPitch
  //    - promotional.videos.otherVideos[]
  //    - promotional.videos.screener
  // 2) Spot the malformed video
  //  - video that exist in storage but not in JWP needs to be uploaded
  //  - video that exist in WJP but not in storage needs to be downloaded
  // 3) Display meaningful info

  const okVideos: MovieVideo[] = [];
  const toCheck: MovieVideo[] = [];
  const emptyVideos: MovieVideo[] = [];
  const notInJWP: MovieVideo[] = [];
  const notInStorage: MovieVideo[] = [];
  const wrongJWPId: MovieVideo[] = [];
  const wrongStoragePath: MovieVideo[] = [];

  const sortVideo = (video: StorageVideo, movieId: string) => {
    if (!video.docId) video.docId = movieId;

    if (isVideoOK(video)) return toCheck.push(video);
    if (isMissingJW(video)) return notInJWP.push(video);
    if (isMissingStorage(video)) return notInStorage.push(video);
    return emptyVideos.push(video);
  }

  const movies = await getCollection<Movie>('movies');
  movies.forEach(movie => {

    const { videos } = movie.promotional;

    if (videos) {
      sortVideo(videos.screener, movie.id);
      sortVideo(videos.salesPitch, movie.id)

      videos.otherVideos?.forEach(video => sortVideo(video, movie.id));
    }
  });

  for (let i = 0 ; i < toCheck.length ; i++) {
    const video = toCheck[i];

    const isJWPok = await checkJWP(jwplayerKey, jwplayerApiV2Secret, video.jwPlayerId);
    await delay(1200); // delay is needed to avoid reaching jwp api rate limit (i.e. 60 calls/min)

    const isStorageOk = await checkStorageFile(video);

    console.log(`${i+1}/${toCheck.length}`);

    if (!isJWPok) wrongJWPId.push(video);
    if (!isStorageOk) wrongStoragePath.push(video);
    if (isJWPok && isStorageOk) okVideos.push(video);
  }


  console.log(`\nThere is ${okVideos.length} correct videos`);
  console.log(`${emptyVideos.length} empty videos.`);
  console.log(`${notInStorage.length} videos that exists in JWP but not in storage (need to be downloaded)`);
  console.log(`${notInJWP.length} videos that exists in the storage but not in JWP (need to be uploaded)`);
  console.log(`${wrongJWPId.length} videos that have a non-existent JWP ID (need to be re-uploaded)`);
  console.log(`${wrongStoragePath.length} videos that have a non-existent storage path (need to be re-downloaded)`);

  console.log('\nVIDEO THAT NEED TO BE DOWNLOADED');
  notInStorage.forEach(v => console.log(v));

  console.log('\nVIDEO THAT NEED TO BE UPLOADED');
  notInJWP.forEach(v => console.log(v));
  console.log('\n');

  console.log('\nVIDEO THAT NEED TO BE RE-UPLOADED (wrong ID)');
  wrongJWPId.forEach(v => console.log(v));
  console.log('\n');

  console.log('\nVIDEO THAT NEED TO BE RE-DOWNLOADED (wrong path)');
  notInStorage.forEach(v => console.log(v));
}
