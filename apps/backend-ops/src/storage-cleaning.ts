import { File as GFile } from '@google-cloud/storage';
import { MovieDocument, OrganizationDocument, PublicUser } from 'apps/backend-functions/src/data/types';  // @TODO (#3471) remove this call to backend-functions
import { getDocument } from '@blockframes/firebase-utils';
import { runChunks } from './tools';
import { startMaintenance, endMaintenance } from '@blockframes/firebase-utils';

export async function cleanStorage(bucket) {
  await startMaintenance();

  const cleanMovieDirOutput = await cleanMovieDir(bucket);
  console.log(`Cleaned ${cleanMovieDirOutput.deleted}/${cleanMovieDirOutput.total} from "movie" directory.`);
  const cleanMoviesDirOutput = await cleanMoviesDir(bucket);
  console.log(`Cleaned ${cleanMoviesDirOutput.deleted}/${cleanMoviesDirOutput.total} from "movies" directory.`);
  const cleanOrgsDirOutput = await cleanOrgsDir(bucket);
  console.log(`Cleaned ${cleanOrgsDirOutput.deleted}/${cleanOrgsDirOutput.total} from "orgs" directory.`);
  const cleanUsersDirOutput = await cleanUsersDir(bucket);
  console.log(`Cleaned ${cleanUsersDirOutput.deleted}/${cleanUsersDirOutput.total} from "users" directory.`);
  const cleanWatermarkDirOutput = await cleanWatermarkDir(bucket);
  console.log(`Cleaned ${cleanWatermarkDirOutput.deleted}/${cleanWatermarkDirOutput.total} from "watermark" directory.`);
  await endMaintenance();

  return true;
}

/**
 * Movie dir should not exists
 * @dev this should be usefull only once
 * @param bucket 
 */
export async function cleanMovieDir(bucket) {
  // Movie dir should not exists
  const files: GFile[] = (await bucket.getFiles({ prefix: 'movie/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {

    if (f.name.split('/').length === 2) {
      
      // Clean files at "movie/" root
      if (await f.delete()) { deleted++; }
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await f.delete()) { deleted++; }
    } else {
      const movieId = f.name.split('/')[1];
      // We check if the file is used before removing it
      const movie = await getDocument<MovieDocument>(`movies/${movieId}`);
      if (!movie && await f.delete()) { deleted++; }
    }
  });

  return { deleted, total: files.length };
}

async function cleanMoviesDir(bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'movies/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {
    if (f.name.split('/').length === 2) {
      // Clean files at "movies/" root
      if (await f.delete()) { deleted++; }
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await f.delete()) { deleted++; }
    } else {
      const movieId = f.name.split('/')[1];
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
async function cleanOrgsDir(bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'orgs/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {
    if (f.name.split('/').length === 2) {
      // Clean files at "orgs/" root
      if (await f.delete()) { deleted++; }
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await f.delete()) { deleted++; }
    } else {
      const orgId = f.name.split('/')[1];
      const org = await getDocument<OrganizationDocument>(`orgs/${orgId}`);
      if (!org && await f.delete()) { deleted++; }
    }
  });

  return { deleted, total: files.length };
}

async function cleanUsersDir(bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'users/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {
    if (f.name.split('/').length === 2 || f.name.split('/').length === 3) {
      // Clean files at "users/" or "user/{$userId}/" root
      if (await f.delete()) { deleted++; }
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await f.delete()) { deleted++; }
    } else {
      const userId = f.name.split('/')[1];
      const user = await getDocument<PublicUser>(`users/${userId}`);
      if (!user && await f.delete()) { deleted++; }
    }
  });

  return { deleted, total: files.length };
}

/**
 * watermark dir is not used anymore
 * watermarks are in users/${userId}/${userId}.svg
 * @param bucket 
 */
async function cleanWatermarkDir(bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'watermark/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {
    if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await f.delete()) { deleted++; }
    } else {
      const userId = f.name.split('/')[1].replace('.svg', '');
      const user = await getDocument<PublicUser>(`users/${userId}`);
      if (!!user) {
        if (user.watermark === f.name) {
          console.log('This should not have happened if migration 29 went well..');
        } else if (await f.delete()) { deleted++; }
      } else if (await f.delete()) { deleted++; }
    }
  });

  return { deleted, total: files.length };
}