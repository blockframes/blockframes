import { Firestore } from '../admin';

function updateStatus(status: string) {
  if (status) {
    return status.toLowerCase();
  } else {
    return 'draft'; // Default value
  }
}

function updateStoreType(type: string) {
  if (type) {
    if (type === 'Library') {
      return 'library';
    }
    if (type === 'Line-Up') {
      return 'line_up';
    }
  } else {
    return 'line_up'; // Default value
  }
}

/**
 * Update storeConfig in movie documents.
 */
async function updateMovieStoreConfig(db: Firestore) {
  const movies = await db.collection('movies').get();

  const newMovieData = movies.docs.map(async (movieDocSnapshot: any): Promise<any> => {
    const movieData = movieDocSnapshot.data();

    const { storeConfig } = movieData.main;

    if (storeConfig) {
      const newData = {
        ...movieData,
        main: {
          ...movieData.main,
          storeConfig: {
            status: updateStatus(storeConfig.status),
            storeType: updateStoreType(storeConfig.storeType)
          }
        }
      }
      return movieDocSnapshot.ref.set(newData);
    }

  });
  await Promise.all(newMovieData);
  console.log('Updating movie documents done.');
}

export async function upgrade(db: Firestore) {
  await updateMovieStoreConfig(db);
}
