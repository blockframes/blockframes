import { Firestore } from '@blockframes/firebase-utils';
import { createHostedVideo } from '@blockframes/movie/+state/movie.model';
import { MovieDocument } from 'apps/backend-functions/src/data/types';

// Replace the old value for unitBox in box office
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map(movieDoc => {
    const data = movieDoc.data();

    const jwPlayerId = data.hostedVideo;
    delete data.hostedVideo;

    const newData = {
      ...data,
      boxOffice: data.boxOffice.map(box => {
        if (box.unit === 'boxoffice_dollar') {
          return {
            ...box,
            unit: 'usd'
          }
        } else if (box.unit === 'boxoffice_euro') {
          return {
            ...box,
            unit: 'eur'
          }
        } else {
          return { ...box }
        }
      })
    } as MovieDocument;

    if (jwPlayerId) {
      newData.promotional.videos = {
        ...newData.promotional.videos,
        screener: createHostedVideo({ jwPlayerId })
      }
    }

    return batch.set(movieDoc.ref, newData);
  })

  console.log('Movie updated.')
  await batch.commit();
}
