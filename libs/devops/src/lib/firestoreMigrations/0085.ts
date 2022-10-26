import { Firestore, Storage, runChunks } from '@blockframes/firebase-utils';
import { createMovieVideo, Movie, MovieVideo } from '@blockframes/model';
import * as env from '@env';

const { storageBucket } = env.firebase();

/**
 * Transform promotional.videos.otherVideos[] into promotional.videos.otherVideo
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore, storage: Storage) {
  const movies = await db.collection('movies').get();
  const bucket = storage.bucket(storageBucket);

  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as Movie;

    const oldOtherVideos: MovieVideo[] = (movie.promotional?.videos as any)?.otherVideos?.filter(o => !!o.storagePath && !!o.jwPlayerId);

    if (oldOtherVideos?.length) {

      // Take first one of array
      const otherVideo = oldOtherVideos.shift();

      // Move file
      const beforePath = `${otherVideo.privacy}/${otherVideo.storagePath}`;
      const afterPath = beforePath.replace('/promotional.videos.otherVideos/', '/promotional.videos.otherVideo/');

      movie.promotional.videos.otherVideo = otherVideo;
      movie.promotional.videos.otherVideo.field = 'promotional.videos.otherVideo';
      movie.promotional.videos.otherVideo.storagePath = movie.promotional.videos.otherVideo.storagePath.replace('/promotional.videos.otherVideos/', '/promotional.videos.otherVideo/');

      const file = bucket.file(beforePath);
      const [exists] = await file.exists();
      if (exists) {
        await file.move(afterPath);
        console.log(`moved ${beforePath} to ${afterPath}`);
      }

      // Delete remaining other videos
      if (oldOtherVideos.length > 0) {
        console.log(`movie ${movie.id} had ${oldOtherVideos.length} other videos, took first`);

        for (const oldOtherVideo of oldOtherVideos) {
          const oldPath = `${oldOtherVideo.privacy}/${oldOtherVideo.storagePath}`;
          const oldFile = bucket.file(oldPath);
          const [exists] = await oldFile.exists();
          if (exists) {
            await oldFile.delete();
            console.log(`deleted ${oldPath}`);
          }
        }

      }
    } else {
      movie.promotional.videos.otherVideo = createMovieVideo({});
    }

    delete (movie.promotional?.videos as any)?.otherVideos;
    await doc.ref.set(movie);

  }).catch(err => console.error(err));
}
