import { Firestore } from '@blockframes/firebase-utils';
import { createHostedVideo } from '@blockframes/movie/+state/movie.model';

export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map(movieDoc => {
    const movie = movieDoc.data();

    const jwPlayerId = movie.hostedVideo;
    delete movie.hostedVideo;

    if (jwPlayerId) {
      movie.promotional.videos = {
        screener: createHostedVideo({ jwPlayerId })
      }
    }

    return batch.set(movieDoc.ref, movie);
  })

  console.log('Updated hosted video format on movie model');
  await batch.commit();
}
