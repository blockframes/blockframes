import { Firestore } from '@blockframes/firebase-utils';

/**
 * Update genres on movie documents
*/
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map(movieDoc => {
    const data = movieDoc.data();
    if (data?.genres?.includes('comingAge') || data?.genres?.includes('coming-of-age')) {
      data.genres = data.genres.map(genre => {
        if (genre === 'comingAge' || genre === 'coming-of-age') {
          return 'youngAdult';
        }
        return genre;
      })
    }
    return batch.set(movieDoc.ref, data);
  })
  await batch.commit();
}