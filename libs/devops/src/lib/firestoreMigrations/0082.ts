import { Firestore, Storage, runChunks } from '@blockframes/firebase-utils';
import { createMovieVideo, Movie, MovieVideo } from '@blockframes/model';
import * as env from '@env';

const { storageBucket } = env.firebase();

/**
 * Update movie documents
 */
export async function upgrade(db: Firestore, storage: Storage) {
  const movies = await db.collection('movies').get();
  const isPublicScreener = (video: MovieVideo) => {
    const title = video.title?.toLowerCase();
    if (!title) return false;
    return title === 'screener' || title === 'screening';
  };
  const field = 'promotional.videos.publicScreener';
  const bucket = storage.bucket(storageBucket);

  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as Movie;

    const otherVideos: MovieVideo[] = (movie.promotional.videos as any).otherVideos;
    if (!otherVideos?.some(isPublicScreener)) return;

    const publicScreener = otherVideos.find(isPublicScreener);

    const beforePath = publicScreener.storagePath;
    const afterPath = beforePath.replace('promotional.videos.otherVideos', field);

    movie.promotional.videos.publicScreener = createMovieVideo({
      ...publicScreener,
      privacy: 'public',
      field,
      storagePath: afterPath
    });

    (movie.promotional.videos as any).otherVideos = otherVideos.filter(video => !isPublicScreener(video));

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
