import { Firestore } from '@blockframes/firebase-utils';

export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map(movieDoc => {
    const data = movieDoc.data();

    const newMovie = {
      ...data
    }
    switch (data.estimatedBudget?.from) {
      case 0: newMovie.estimatedBudget = 1000000
        break;
      case 1000000: newMovie.estimatedBudget = 2000000
        break;
      case 2000000: newMovie.estimatedBudget = 35000000
        break;
      case 3500000: newMovie.estimatedBudget = 5000000
        break;
      case 5000000: newMovie.estimatedBudget = 10000000
        break;
      case 10000000: newMovie.estimatedBudget = 20000000
        break;
      case 20000000: newMovie.estimatedBudget = 999999999
        break;
      default: newMovie.estimatedBudget = null;
        break;
    }
    batch.set(movieDoc.ref, newMovie)
  })
  console.log('New Budget Range set')
  await batch.commit();
}