import { Firestore, Storage, runChunks } from '@blockframes/firebase-utils';
import { createMovieVideo, Movie, MovieVideo } from '@blockframes/model';
import * as env from '@env';

const { storageBucket } = env.firebase();

/**
 * Update movie documents
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore, storage: Storage) {
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as Movie;
    const getPublicScreener = ( video: MovieVideo ) => video.title?.toLowerCase().includes('screen');

    const otherVideos = movie.promotional.videos.otherVideos;
    if (!otherVideos?.some(getPublicScreener)) return;

    const publicScreener = otherVideos.find(getPublicScreener);
    const bucket = storage.bucket(storageBucket);

    const beforePath = publicScreener.storagePath;
    const afterPath = beforePath.replace('promotional.videos.otherVideos', 'promotional.videos.publicScreener');

    movie.promotional.videos.publicScreener = createMovieVideo({
      ...publicScreener,
      privacy: 'public',
      field: 'promotional.videos.publicScreener',
      storagePath: afterPath
    });

    movie.promotional.videos.otherVideos = otherVideos.filter(video => !getPublicScreener(video));

    await doc.ref.set(movie);

    // move file
    const file = bucket.file(`${publicScreener.privacy}/${beforePath}`);
    const [exists] = await file.exists();
    if (exists) {
      // set moving flag to prevent upload to jwPlayer
      await file.setMetadata({ metadata: { privacy: 'public', moving: 'true' } });
      await file.move(`public/${afterPath}`);
    }

  }).catch(err => console.error(err));
}
