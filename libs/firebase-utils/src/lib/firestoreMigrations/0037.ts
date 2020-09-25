import { Firestore } from '@blockframes/firebase-utils';


// Update the totalBudget field
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map(movieDoc => {
    const movie = movieDoc.data();

    delete movie.totalBudget;

    const transformedStillPhotos = []

    if (!Array.isArray(movie.promotional.still_photo) && typeof movie.promotional.still_photo === 'object') {
      Object.keys(movie.promotional.still_photo).forEach(key => {
        transformedStillPhotos.push(movie.promotional.still_photo[key])
      })
    }

    movie.promotional.still_photo = transformedStillPhotos

    // Initialize the new totalBudget used in the financial details page and update still photos
    const newData = {
      ...movie,
      totalBudget: {},
      promotional: {
        ...movie.promotional,
        still_photo: transformedStillPhotos
      }
    };

    return batch.set(movieDoc.ref, newData);
  })

  console.log('New totalBudget on movies');
  await batch.commit();
}
