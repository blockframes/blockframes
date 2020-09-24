import { Firestore } from '../admin';

export async function upgrade(db: Firestore) {
  await updateMovieDocument(db);
}

async function updateMovieDocument(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();


  movies.docs.map(movieDoc => {
    const movie = movieDoc.data();
    const updatedStillPhoto = [];
    console.log(movie)
    if (!Array.isArray(movie.promotionalElements.still_photo)) {
      if (typeof movie.promotionalElements.still_photo === 'object') {
        Object.keys(movie.promotionalElements.still_photo).forEach(key => {
          updatedStillPhoto.push(movie.promotionalElements.still_photo[key])
        })
      }
    }
    const updatedMovie = { ...movie, promotionalElements: { still_photos: updatedStillPhoto } };
    batch.set(movieDoc.ref, updatedMovie);
  })

  console.log('Still_photos updated.')
  await batch.commit();
}

