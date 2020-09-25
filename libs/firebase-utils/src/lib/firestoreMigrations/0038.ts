import { Firestore } from '@blockframes/firebase-utils';

export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map(movieDoc => {
    const movie = movieDoc.data();

    const transformedStillPhotos = []

    if (!Array.isArray(movie.promotional.still_photo) && typeof movie.promotional.still_photo === 'object') {
      Object.keys(movie.promotional.still_photo).forEach(key => {
        transformedStillPhotos.push(movie.promotional.still_photo[key])
      })
    }

    movie.promotional.still_photo = transformedStillPhotos
    return batch.set(movieDoc.ref, movie);
  })

  console.log('Transformed still photos into an array');
  await batch.commit();
}
