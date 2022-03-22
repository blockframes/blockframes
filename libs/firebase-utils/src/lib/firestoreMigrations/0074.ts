import { Firestore } from '../types';
import { runChunks } from '../firebase-utils';
import { Movie } from '@blockframes/model';

/**
 * Update all movies genre (old genres becomes keywords)
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  await migrateMovie(db);
}

async function migrateMovie(db: Firestore) {
  const movies = await db.collection('movies').get();
  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as Movie;

    // Check if movie has a crew with mini 1 member
    if (movie.crew.length == 0) return

    // Replace all bad 'confiremd' with the fix one
    movie.crew = movie.crew.map((crew) => {

      // If status == confiremd
      if (crew.status as any === "confiremd") {
        console.log(movie.id)
        return {
          ...crew,
          status: 'confirmed'
        }
      }
    })

    // Update movie in DB
    // await doc.ref.set(movie);
  }).catch(err => console.error(err));
}