import { MovieDocument } from '@blockframes/movie/+state/movie.firestore';
import { OrganizationDocument } from '@blockframes/organization/+state/organization.firestore';
import { PublicUser } from '@blockframes/user/types';
import { getDocument, runChunks } from '@blockframes/firebase-utils';
import type { Bucket, File as GFile } from '@google-cloud/storage';

export async function cleanStorage(bucket: Bucket) {

  const cleanMovieDirOutput = await cleanMovieDir(bucket);
  console.log(`Cleaned ${cleanMovieDirOutput.deleted}/${cleanMovieDirOutput.total} from "public/movie" directory.`);
  const cleanMoviesDirOutput = await cleanMoviesDir(bucket);
  console.log(`Cleaned ${cleanMoviesDirOutput.deleted}/${cleanMoviesDirOutput.total} from "public/movies" directory.`);
  const cleanOrgsDirOutput = await cleanOrgsDir(bucket);
  console.log(`Cleaned ${cleanOrgsDirOutput.deleted}/${cleanOrgsDirOutput.total} from "public/orgs" directory.`);
  const cleanUsersDirOutput = await cleanUsersDir(bucket);
  console.log(`Cleaned ${cleanUsersDirOutput.deleted}/${cleanUsersDirOutput.total} from "public/users" directory.`);

  return true;
}

/**
 * Movie dir should not exists
 * @dev this should be usefull only once
 * @param bucket
 */
export async function cleanMovieDir(bucket: Bucket) {
  // Movie dir should not exists
  const files: GFile[] = (await bucket.getFiles({ prefix: 'public/movie/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {

    if (f.name.split('/').length === 3) {
      // Clean files at "public/movie/" root
      if (await f.delete()) { deleted++; }
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await f.delete()) { deleted++; }
    } else {
      const movieId = f.name.split('/')[2];
      // We check if the file is used before removing it
      const movie = await getDocument<MovieDocument>(`movies/${movieId}`);
      if (!movie && await f.delete()) { deleted++; }
    }
  });

  return { deleted, total: files.length };
}

export async function cleanMoviesDir(bucket: Bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'public/movies/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {
    if (f.name.split('/').length === 3) {
      // Clean files at "public/movies/" root
      if (await f.delete()) { deleted++; }
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await f.delete()) { deleted++; }
    } else {
      const movieId = f.name.split('/')[2];
      const movie = await getDocument<MovieDocument>(`movies/${movieId}`);
      if (!movie && await f.delete()) { deleted++; }
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
      if (await f.delete()) { deleted++; }
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await f.delete()) { deleted++; }
    } else {
      const orgId = f.name.split('/')[2];
      const org = await getDocument<OrganizationDocument>(`orgs/${orgId}`);
      if (!org && await f.delete()) { deleted++; }
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
      if (await f.delete()) { deleted++; }
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await f.delete()) { deleted++; }
    } else {
      const userId = f.name.split('/')[2];
      const user = await getDocument<PublicUser>(`users/${userId}`);
      if (!user && await f.delete()) { deleted++; }
    }
  });

  return { deleted, total: files.length };
}
