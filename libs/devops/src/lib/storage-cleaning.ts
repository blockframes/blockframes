import { PublicUser, Organization, Movie } from '@blockframes/model';
import { getDocument, runChunks } from '@blockframes/firebase-utils';
import type { Bucket, File as GFile } from '@google-cloud/storage';

/**
 * @dev Warning, this function is not meant to be called with firestore emulator
 * @param bucket 
 * @returns 
 */
export async function cleanStorage(bucket: Bucket) {
  const cleanMoviesDirOutput = await cleanMoviesDir(bucket);
  console.log(`Cleaned ${cleanMoviesDirOutput.deleted}/${cleanMoviesDirOutput.total} from "public/movies" directory.`);
  const cleanOrgsDirOutput = await cleanOrgsDir(bucket);
  console.log(`Cleaned ${cleanOrgsDirOutput.deleted}/${cleanOrgsDirOutput.total} from "public/orgs" directory.`);
  const cleanUsersDirOutput = await cleanUsersDir(bucket);
  console.log(`Cleaned ${cleanUsersDirOutput.deleted}/${cleanUsersDirOutput.total} from "public/users" directory.`);

  return true;
}

export async function cleanMoviesDir(bucket: Bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'public/movies/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {
    if (f.name.split('/').length === 3) {
      // Clean files at "public/movies/" root
      if (await f.delete()) {
        deleted++;
      }
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await f.delete()) {
        deleted++;
      }
    } else {
      const movieId = f.name.split('/')[2];
      const movie = await getDocument<Movie>(`movies/${movieId}`);
      if (!movie && (await f.delete())) {
        deleted++;
      }
    }
  });

  return { deleted, total: files.length };
}

/**
 * Revomes files at "orgs/" root,
 * files that have a too long name and
 * files that belongs to deleted orgs on DB.
 * @param bucket
 */
export async function cleanOrgsDir(bucket: Bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'public/orgs/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {
    if (f.name.split('/').length === 3) {
      // Clean files at "public/orgs/" root
      if (await f.delete()) {
        deleted++;
      }
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await f.delete()) {
        deleted++;
      }
    } else {
      const orgId = f.name.split('/')[2];
      const org = await getDocument<Organization>(`orgs/${orgId}`);
      if (!org && (await f.delete())) {
        deleted++;
      }
    }
  });

  return { deleted, total: files.length };
}

export async function cleanUsersDir(bucket: Bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'public/users/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {
    if (f.name.split('/').length === 3 || f.name.split('/').length === 4) {
      // Clean files at "public/users/" or "public/user/{$userId}/" root
      if (await f.delete()) {
        deleted++;
      }
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await f.delete()) {
        deleted++;
      }
    } else {
      const userId = f.name.split('/')[2];
      const user = await getDocument<PublicUser>(`users/${userId}`);
      if (!user && (await f.delete())) {
        deleted++;
      }
    }
  });

  return { deleted, total: files.length };
}
