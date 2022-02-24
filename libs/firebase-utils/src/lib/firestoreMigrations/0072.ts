import { Firestore } from '../types';
import { runChunks } from '../firebase-utils';

/**
 * Update all events with the right accessibility property (instead of isPrivate property)
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const contentTypesToMovie = [
    'animation', 
    'feature_film',
    'short',
    'tv_film'
  ]
  const contentTypesToTV = [
    'flow',
    'series',
    'performing_arts'
  ]
  const movies = await db.collection('movies').get();

  return runChunks( 
    movies.docs,
    async (doc) => {
      const movie = doc.data();

      if (movie.contentType === 'documentary') {
        //According to Camille, documentary content type become tv or movie depending of their duration
        movie.contentType = movie.runningTime.time < 60 ? 'tv' : 'movie';
      } else if (contentTypesToMovie.includes(movie.contentType)) {
        movie.contentType = 'movie';
      } else if (contentTypesToTV.includes(movie.contentType)) {
        movie.contentType = 'tv';
      }
      await doc.ref.set(movie);
    }
  ).catch(err => console.error(err));
}