import { Firestore } from '../types';



/**
 * Update workType in movie documents.
 */
export async function updateMovieWorkType(db: Firestore) {
  const movies = await db.collection('movies').get();

  const newMovieData = movies.docs.map(async (movieDocSnapshot: any): Promise<any> => {
    const movieData = movieDocSnapshot.data();

    const { workType } = movieData.main;

    if (workType.trim().toLowerCase() === 'movie') {

      const newData = {
        ...movieData,
        main: {
          ...movieData.main,
          workType: 'feature_film'
        }
      };

      return movieDocSnapshot.ref.set(newData);
    }

  });
  await Promise.all(newMovieData);
  console.log('Updating movie documents done.');
}

export async function upgrade(db: Firestore) {
  await updateMovieWorkType(db);
}
