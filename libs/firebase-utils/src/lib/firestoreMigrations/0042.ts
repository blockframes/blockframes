
import { runChunks } from '../firebase-utils';
import { Firestore } from '../types';

export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data();

    const orgsRelatedToMovie = await db.collection('orgs').where('movieIds', 'array-contains', movie.id).get();
    movie.orgIds = orgsRelatedToMovie.docs.map(org => org.data().id);

    await doc.ref.set(movie);
  });
}