import { Firestore } from '../types';
import { runChunks } from '../firebase-utils';
import { Movie } from '@blockframes/model';

/**
 * Update all movies genre (old genres becomes keywords)
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as Movie;

    // Check if movie has a crew with mini 1 member
    if (movie.crew.length == 0) return

    // Replace all bad 'confiremd' with the fix one
    movie.crew = movie.crew.map((crew) => ({
      ...crew,
      status: crew.status as any == 'confiremd' ? 'confirmed' : crew.status
    }))
    
    // Update movie in DB
    await doc.ref.set(movie);

  }).catch(err => console.error(err));
}
