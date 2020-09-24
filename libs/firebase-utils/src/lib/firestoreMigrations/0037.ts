import { Firestore } from '@blockframes/firebase-utils';


// Update the totalBudget field from the old version (Price interface) to the new one (MovieTotalBudget interface)
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map(movieDoc => {
    const movie = movieDoc.data();

    delete movie.totalBudget;

    // Initialize the new totalBudget used in the financial details page
    const newData = {
      ...movie,
      totalBudget: {
        castCost: null,
        currency: null,
        others: null,
        postProdCost: null,
        producerFees: null,
        shootCost: null
      }
    };

    return batch.set(movieDoc.ref, newData);
  })

  console.log('New totalBudget on movies');
  await batch.commit();
}
