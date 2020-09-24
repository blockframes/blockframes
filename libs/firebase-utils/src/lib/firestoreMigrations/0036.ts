import { Firestore } from '@blockframes/firebase-utils';


export async function upgrade(db: Firestore) {
  await updateMovieDocument(db);
  await updateRightDocuments(db);
}

/**
 *  Move every current prizes into a new customPrizes field because of the introduction of a new static model about festival prize
 *  Update the production status and correct the typo into the constant
 */
async function updateMovieDocument(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map(movieDoc => {
    const movie = movieDoc.data();

    delete movie.releaseYear;
    delete movie.totalRunTime;

    const newMovieData = {
      ...movie,
      customPrizes: movie.prizes,
      prizes: [],
      productionStatus: updateProductionStatus(movie.productionStatus),
    };

    return batch.set(movieDoc.ref, newMovieData);
  });

  console.log('Movie updated.')
  await batch.commit();
}

/**
 *  Correct a typo on the distribution right status (sub-collection)
 */
async function updateRightDocuments(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  const updates = movies.docs.map(async movieDoc => {
    const distributionRights = await movieDoc.ref.collection('distributionRights').get();

    if (distributionRights) {
      distributionRights.docs.map(rightDoc => {
        const right = rightDoc.data();

        const newRightData = {
          ...right,
          status: updateRightStatus(right.status)
        };
        return batch.update(rightDoc.ref, newRightData);
      })
    }

  });

  console.log('Distribution Right status updated.')
  await Promise.all(updates);
  await batch.commit();
}

// Update the production status
function updateProductionStatus(status: string) {
  if (status === 'financing') {
    return 'development';
  } else if (status === 'post-production') {
    return 'post_production';
  } else {
    return status;
  }
}

// Update the right status
function updateRightStatus(status: string) {
  if (status === 'Draft') {
    return 'draft';
  } else {
    return status;
  }
}
