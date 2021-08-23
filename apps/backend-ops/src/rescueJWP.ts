
import { Movie } from '@blockframes/movie/+state';
import { getCollection } from '@blockframes/firebase-utils';
import { MovieVideo } from '@blockframes/movie/+state/movie.firestore';
import { StorageVideo } from '@blockframes/media/+state/media.firestore';


function isVideoOK(video: StorageVideo) {
  return [
    'jwPlayerId',
    'privacy',
    'collection',
    'docId',
    'field',
    'storagePath',
  ].every(key => !!video[key]);
}

/** Check for video that exists in the storage but NOT in JWP */
function isMissingJW(video: StorageVideo) {
  return (!video.jwPlayerId && !!video.storagePath);
}

/** Check for video that exists in JWP but NOT in the storage */
function isMissingStorage(video: StorageVideo) {
  return (!!video.jwPlayerId && !video.storagePath);
}

export async function rescueJWP() {

  // 1) Get all videos in DB
  //  - Movies
  //    - promotional.salesPitch
  //    - promotional.videos.otherVideos[]
  //    - promotional.videos.screener
  // 2) Spot the malformed video
  //  - video that exist in storage but not in JWP needs to be uploaded
  //  - video that exist in WJP but not in storage needs to be downloaded
  // 3) Display meaningful info

  const okVideos: MovieVideo[] = [];
  const emptyVideos: MovieVideo[] = [];
  const notInJWP: MovieVideo[] = [];
  const notInStorage: MovieVideo[] = [];

  const sortVideo = (video: StorageVideo, movieId: string) => {
    if (!video.docId) video.docId = movieId;

    if (isVideoOK(video)) return okVideos.push(video);
    if (isMissingJW(video)) return notInJWP.push(video);
    if (isMissingStorage(video)) return notInStorage.push(video);
    return emptyVideos.push(video);
  }

  const movies = await getCollection<Movie>('movies');
  movies.forEach(movie => {

    const { salesPitch, videos } = movie.promotional;

    if (salesPitch) sortVideo(salesPitch, movie.id);
    if (videos) {
      sortVideo(videos.screener, movie.id);

      videos.otherVideos?.forEach(video => sortVideo(video, movie.id));
    }
  });


  console.log(`\nThere is ${okVideos.length} correct videos`);
  console.log(`${emptyVideos.length} empty videos.`);
  console.log(`${notInStorage.length} videos that exists in JWP but not in storage (need to be downloaded)`);
  console.log(`${notInJWP.length} videos that exists in the storage but not in JWP (need to be uploaded)`);

  console.log('\nVIDEO THAT NEED TO BE DOWNLOADED');
  notInStorage.forEach(v => console.log(v));

  console.log('\nVIDEO THAT NEED TO BE UPLOADED');
  notInJWP.forEach(v => console.log(v));
  console.log('\n');
}
