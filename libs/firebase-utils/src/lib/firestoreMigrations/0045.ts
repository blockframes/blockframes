import { Firestore } from '@blockframes/firebase-utils';
import { MovieDocument } from '@blockframes/movie/+state/movie.firestore';

/**
 * Update the screener with fake ref if missing
*/
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map(movieDoc => {
    const data = movieDoc.data();
    if(!data.promotional.videos?.screener?.ref && !!data.promotional.videos?.screener?.jwPlayerId) {
      const fakeRefForExistingScreeners = `protected/movies/${data.id}/promotional.videos.screener/default.mp4`;
      const newData = {
        ...data,
      } as MovieDocument;

      newData.promotional.videos.screener.ref = fakeRefForExistingScreeners;
      return batch.set(movieDoc.ref, newData);
    }
  })

  await batch.commit();
}