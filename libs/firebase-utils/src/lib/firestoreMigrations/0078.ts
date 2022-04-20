import { Firestore } from '../types';
import { runChunks } from '../firebase-utils';
import { Movie } from '@blockframes/model';

/**
 * Remove all from available versions on Movie #7151
 * Some titles have incorrect model for customPrizes #7812
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {

  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as Movie;

    let update = false;
    if ((movie.languages as any).all) {
      delete (movie.languages as any).all;
      update = true;
    }

    if (movie.customPrizes?.length && movie.customPrizes.some(p => Array.isArray(p.premiere))) {
      update = true;
      movie.customPrizes = movie.customPrizes.map(p => {
        if (Array.isArray(p.premiere)) {
          return { ...p, premiere: p.premiere[0] };
        } else {
          return p;
        }
      })
    }

    if (update) await doc.ref.set(movie);
  }).catch(err => console.error(err));
}
