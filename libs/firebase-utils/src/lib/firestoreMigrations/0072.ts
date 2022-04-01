import { Firestore } from '../types';
import { runChunks } from '../firebase-utils';
import { Movie } from '@blockframes/shared/model';

/**
 * Update movies content type
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const transform = {
    animation: () => 'movie',
    feature_film: () => 'movie',
    short: () => 'movie',
    tv_film: () => 'movie',
    flow: () => 'tv',
    series: () => 'tv',
    performing_arts: () => 'tv',
    documentary: (movie: Movie) => (movie.runningTime.time < 60 ? 'tv' : 'movie'),
  };
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async doc => {
    const movie = doc.data();
    if (Object.keys(transform).includes(movie.contentType)) {
      movie.contentType = transform[movie.contentType](movie);
    }
    await doc.ref.set(movie);
  }).catch(err => console.error(err));
}
