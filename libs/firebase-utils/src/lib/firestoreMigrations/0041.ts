import { Firestore } from '@blockframes/firebase-utils';


export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map(movieDoc => {
    const movie = movieDoc.data();

    const newData = {
      ...movie,
      runningTime: updateRunningTime(movie.runningTime)
    };

    return batch.set(movieDoc.ref, newData);
  })

  console.log('Running time updated on movies');
  await batch.commit();
}

function updateRunningTime(runningTime) {
  if (typeof runningTime.time === 'number') {
    runningTime.time = runningTime.time
  } else delete runningTime.time;

  return runningTime;
}
