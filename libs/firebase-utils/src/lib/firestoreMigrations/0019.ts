import { Firestore } from '../types';

const updateStoreConfig = (oldStoreConfig) => {
  if (oldStoreConfig) {
    if (!oldStoreConfig.appAccess) {
      return {
        ...oldStoreConfig,
        appAccess: {
          catalog: true,
          festival: false
        }
      };
    } else {
      return oldStoreConfig;
    }
  }
};

/**
 * Add appAccess with catalog and festival booleans in storeConfig in movie documents.
 */
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();

  const newMovieData = movies.docs.map(
    async (movieDocSnapshot: any): Promise<any> => {
      const movieData = movieDocSnapshot.data();

      const storeConfig = updateStoreConfig(movieData.main.storeConfig);

      if (storeConfig) {
        const newData = {
          ...movieData,
          main: {
            ...movieData.main,
            storeConfig
          }
        };
        return movieDocSnapshot.ref.set(newData);
      }
    }
  );
  await Promise.all(newMovieData);
  console.log('Updating movie documents done.');
}
