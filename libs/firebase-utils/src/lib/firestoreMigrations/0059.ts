import { Firestore } from '@blockframes/firebase-utils';
import { runChunks } from '../firebase-utils';

export async function upgrade(db: Firestore) {

  const movies = await db.collection('movies').get();

  /*
    Replace originalRelease media 'hotels' with 'video'
  */
  return runChunks(movies.docs, async (movieDoc) => {
    const movie = movieDoc.data();
    for (const release of movie.originalRelease) {
      if (release.media === 'hotels') {
        release.media = 'video';
      }
    }
  
    await movieDoc.ref.set(movie);
  });
}
