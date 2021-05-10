import { runChunks } from '../firebase-utils';
import { producerRoles} from '@blockframes/utils/static-model/static-model';
import { Firestore } from '../types';
import { Producer } from '@blockframes/utils/common-interfaces/identity';

export async function upgrade(db: Firestore, producer: Producer) {
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data();
    let update = false;

    if (movie.producers.role === producer.role) {
      update = true;
      movie.producers.role = producerRoles;
    }

    await doc.ref.set(movie);
  });
}
