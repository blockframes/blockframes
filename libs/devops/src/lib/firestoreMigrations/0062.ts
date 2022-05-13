import { Firestore, runChunks } from '@blockframes/firebase-utils';


export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data();
    let update = false;

    movie.producers.map(producer => {
      if (producer.role === 'productionManager') {
        producer.role = 'producer';
        update = true;
      }
      else if (producer.role === 'lineProducer') {
        producer.role = '';
        update = true;
      }
    })

    if (update) {
      await doc.ref.set(movie);
    }
  });
}
