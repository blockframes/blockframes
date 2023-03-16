import { Firestore, runChunks } from '@blockframes/firebase-utils';
import { createMovieAppConfig, Movie } from '@blockframes/model';

/**
 * Adds default movie access for waterfall app
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as Movie;

    movie.app = createMovieAppConfig(movie.app);
    await doc.ref.set(movie);

  }).catch(err => console.error(err));
}
