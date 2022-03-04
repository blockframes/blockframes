
import * as env from '@env';
import { Firestore } from '../types';
import { runChunks } from '../firebase-utils';
import { createMovieVideo, createMovieVideos } from '@blockframes/data-model';

export const { storageBucket } = env.firebase();

/**
 * Move movie.promotional.salesPitch to movie.promotional.videos.salesPitch
 * Change video type 'pitch' to 'other'
 * @param db
 * @param storage
 * @returns
 */
export async function upgrade(db: Firestore) {

  const movies = await db.collection('movies').get();
  await runChunks(movies.docs, async doc => {
    const movie = doc.data();

    if (!movie.promotional.videos) {
      movie.promotional.videos = createMovieVideos({});
    }

    movie.promotional.videos.salesPitch = createMovieVideo(movie.promotional.salesPitch);
    delete movie.promotional.salesPitch;

    if (movie.promotional.videos?.otherVideos?.length) {
      movie.promotional.videos.otherVideos.forEach(video => {
        if (video.type === 'pitch') {
          video.type = 'other';
        }
      });
    }

    await doc.ref.set(movie);
  })

  console.log('movie data model updated !');
}
