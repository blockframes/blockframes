import { Firestore } from '@blockframes/firebase-utils';
import { runChunks } from '../firebase-utils';

export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();

  /* Replace seasons with TV series */
  return runChunks(movies.docs, async (movieDoc) => {
    const movie = movieDoc.data();
    if (movie.contentType === 'season') {
      movie.contentType = 'series';
    }
    if (movie.contentType === 'serie') {
      movie.contentType = 'series';
    }
    await movieDoc.ref.set(movie);
  });
}
