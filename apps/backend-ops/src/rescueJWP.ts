
import { Movie } from '@blockframes/movie/+state';
import { loadAdminServices } from '@blockframes/firebase-utils';
import { MovieVideo } from '@blockframes/movie/+state/movie.firestore';
import { StorageVideo } from '@blockframes/media/+state/media.firestore';


function isVideoOK(video: StorageVideo) {
  return !!video.jwPlayerId &&
    !!video.privacy && !!video.collection && !!video.docId && !!video.field &&
    !!video.storagePath
  ;
}

// function isMalformed(video: StorageVideo) {
//   return (!video.jwPlayerId && !!video.storagePath) ||
//     (!!video.jwPlayerId && !video.storagePath)
//   ;
// }

/** Check for video that exists in the storage but NOT in JWP */
function isMissingJW(video: StorageVideo) {
  return (!video.jwPlayerId && !!video.storagePath);
}

/** Check for video that exists in JWP but NOT in the storage */
function isMissingStorage(video: StorageVideo) {
  return (!!video.jwPlayerId && !video.storagePath);
}

export async function rescueJWP() {
  const { db } = loadAdminServices();

  // 1) Get all videos in DB
  //  - Movies
  //    - promotional.salesPitch
  //    - promotional.videos.otherVideos[]
  //    - promotional.videos.screener

  const okVideos: MovieVideo[] = [];
  const emptyVideos: MovieVideo[] = [];
  const notInJWP: MovieVideo[] = [];
  const notInStorage: MovieVideo[] = [];

  const sortVideo = (video: StorageVideo, movieId: string) => {
    if (!video.docId) video.docId = movieId;
    if (isVideoOK(video)) {
      okVideos.push(video);
    } else {
      if (isMissingJW(video)) {
        notInJWP.push(video);
      } if (isMissingStorage(video)) {
        notInStorage.push(video);
      } else {
        emptyVideos.push(video);
      }
    }
  }

  const moviesSnap = await db.collection('movies').get();
  moviesSnap.forEach(movieSnap => {
    const movie = movieSnap.data() as Movie;

    if (movie.promotional.salesPitch) sortVideo(movie.promotional.salesPitch, movie.id);
    if (movie.promotional.videos) {
      sortVideo(movie.promotional.videos.screener, movie.id);

      movie.promotional.videos.otherVideos?.forEach(video => sortVideo(video, movie.id));
    }
  });

  console.log('');

  console.log(`There is ${okVideos.length} correct videos`);
  console.log(`${emptyVideos.length} empty videos.`);
  console.log(`${notInStorage.length} videos that exists in JWP but not in storage (need to be downloaded)`);
  console.log(`${notInJWP.length} videos that exists in the storage but not in JWP (need to be uploaded)`);

  console.log('');
  console.log('VIDEO THAT NEED TO BE DOWNLOADED');
  notInStorage.forEach(v => console.log(v));

  console.log('');
  console.log('VIDEO THAT NEED TO BE UPLOADED');
  notInStorage.forEach(v => console.log(v));
  console.log('');
}
