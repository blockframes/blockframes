import { Firestore, runChunks } from '@blockframes/firebase-utils';

export async function upgrade(db: Firestore) {

  const movies = await db.collection('movies').get();

  /*
    Replace originalRelease media 'hotels' with 'video'
  */
  return runChunks(movies.docs, async (movieDoc) => {
    const movie = movieDoc.data();
    let update = false;
    for (const release of movie.originalRelease) {
      if (release.media === 'hotels') {
        release.media = 'video';
        update = true;
      }
    }

    if (update) {
      await movieDoc.ref.set(movie);
    }
  });
}
