import { Firestore, runChunks } from '@blockframes/firebase-utils';
import { Movie, MovieVideo } from '@blockframes/model';

/**
 * Update movie documents
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as Movie;
    const getPublicScreener = ( video: MovieVideo ) => video.title?.toLowerCase().includes('screen');

    const otherVideos = movie.promotional.videos.otherVideos;
    if (!otherVideos?.some(getPublicScreener)) return;

    movie.promotional.videos.publicScreener = otherVideos.find(getPublicScreener);
    movie.promotional.videos.otherVideos = otherVideos.filter(video => !getPublicScreener(video));

    await doc.ref.set(movie);
  }).catch(err => console.error(err));
}
