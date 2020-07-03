import { loadAdminServices } from './admin';
import { getStorageBucketName } from 'apps/backend-functions/src/internals/firebase';
import { File as GFile } from '@google-cloud/storage';
import { MovieDocument } from 'apps/backend-functions/src/data/types';
import { getDocument } from 'apps/backend-functions/src/data/internals'

export async function cleanStorage() {
  const { storage } = loadAdminServices();
  const bucket = storage.bucket(getStorageBucketName());

  // Movie dir should not exists
  const files: GFile[] = (await bucket.getFiles({ prefix: 'movie/' }))[0];

  for (const f of files) {
    const movieId = f.name.split('/')[1];
    // We check if the file is used before removing it
    const movie = await getDocument<MovieDocument>(`movies/${movieId}`);
    if (!!movie) {
      console.log(`Found movie for ${f.name} : ${movie.main.title.original}`);
      if (!findRefInMovie(movie, f.name)) {
        console.log(`Ref was not found in document.`);
        await f.delete();
        console.log(`File ${f.name} deleted`);
      }
    } else {
      console.log(`Movie ${movieId} does not exists anymore.`);
      await f.delete();
      console.log(`File ${f.name} deleted`);
    }
  }

}

function findRefInMovie(movie: MovieDocument, ref: string) {
  if (movie.promotionalElements.banner.media.ref === ref) {
    return true;
  }

  if (movie.promotionalElements.poster.some(p => p.media.ref === ref)) {
    return true;
  }

  if (movie.promotionalElements.still_photo.some(p => p.media.ref === ref)) {
    return true;
  }

  if (movie.promotionalElements.presentation_deck.media.ref === ref) {
    return true;
  }

  if (movie.promotionalElements.scenario.media.ref === ref) {
    return true;
  }

  if (movie.promotionalElements.promo_reel_link.media.ref === ref) {
    return true;
  }

  if (movie.promotionalElements.screener_link.media.ref === ref) {
    return true;
  }

  if (movie.promotionalElements.trailer_link.media.ref === ref) {
    return true;
  }

  if (movie.promotionalElements.teaser_link.media.ref === ref) {
    return true;
  }

  return false;
}