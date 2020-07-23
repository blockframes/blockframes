import { loadAdminServices } from './admin';
import { getStorageBucketName } from 'apps/backend-functions/src/internals/firebase';
import { File as GFile, Bucket } from '@google-cloud/storage';
import { MovieDocument, OrganizationDocument, PublicUser } from 'apps/backend-functions/src/data/types';
import { getDocument } from 'apps/backend-functions/src/data/internals'
import { runChunks } from './tools';

// @TODO (#3175) temp 
// gsutil -m rsync -r gs://blockframes.appspot.com gs://blockframes-bruce.appspot.com && node dist/apps/backend-ops/main.js restore
// export ENV=dev && npx ng build backend-ops --configuration=dev
// still S512yYOhaMlezFIgUnrF

const rowsConcurrency = 10;

export async function cleanStorage() {
  const { storage } = loadAdminServices();
  const bucket = storage.bucket(getStorageBucketName());

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
}

/**
 * Movie dir should not exists
 * @dev this should be usefull only once
 * @param bucket 
 */
async function cleanMovieDir(bucket: Bucket) {
  // Movie dir should not exists
  const files: GFile[] = (await bucket.getFiles({ prefix: 'movie/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {
    if (f.name.split('/').length === 2) {
      // Clean files at "movie/" root
      const d = await smartDelete(f, files);
      deleted = deleted + d;
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      const d = await smartDelete(f, files);
      deleted = deleted + d;
    } else {
      const movieId = f.name.split('/')[1];
      // We check if the file is used before removing it
      const movie = await getDocument<MovieDocument>(`movies/${movieId}`);
      if (!movie) {
        const d = await smartDelete(f, files);
        deleted = deleted + d;
      }
    }
  });

  return { deleted, total: files.length };
}

async function cleanMoviesDir(bucket: Bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'movies/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {
    if (f.name.split('/').length === 2) {
      // Clean files at "movies/" root
      const d = await smartDelete(f, files);
      deleted = deleted + d;
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      const d = await smartDelete(f, files);
      deleted = deleted + d;
    } else {
      const movieId = f.name.split('/')[1];
      const movie = await getDocument<MovieDocument>(`movies/${movieId}`);
      if (!movie) {
        const d = await smartDelete(f, files);
        deleted = deleted + d;
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
async function cleanOrgsDir(bucket: Bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'orgs/' }))[0];
  let deleted = 0;
  const pattern = '/logo';

  await runChunks(files, async (f) => {
    if (f.name.split('/').length === 2) {
      // Clean files at "orgs/" root
      const d = await smartDelete(f, files, pattern);
      deleted = deleted + d;
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      const d = await smartDelete(f, files, pattern);
      deleted = deleted + d;
    } else {
      const orgId = f.name.split('/')[1];
      const org = await getDocument<OrganizationDocument>(`orgs/${orgId}`);
      if (!org) {
        const d = await smartDelete(f, files, pattern);
        deleted = deleted + d;
      }
    }
  });

  return { deleted, total: files.length };
}

async function cleanUsersDir(bucket: Bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'users/' }))[0];
  let deleted = 0;
  const pattern = '/avatar';

  await runChunks(files, async (f) => {
    if (f.name.split('/').length === 2 || f.name.split('/').length === 3) {
      // Clean files at "users/" or "user/{$userId}/" root
      const d = await smartDelete(f, files, pattern);
      deleted = deleted + d;
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      const d = await smartDelete(f, files, pattern);
      deleted = deleted + d;
    } else {
      const userId = f.name.split('/')[1];
      const user = await getDocument<PublicUser>(`users/${userId}`);
      if (!user) {
        const d = await smartDelete(f, files, pattern);
        deleted = deleted + d;
      }
    }
  });

  return { deleted, total: files.length };
}

/**
 * watermark dir is not used anymore
 * watermarks are in users/${userId}/${userId}.svg
 * @param bucket 
 */
async function cleanWatermarkDir(bucket: Bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'watermark/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {
    if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await f.delete()) {
        deleted++;
      }
    } else {
      const userId = f.name.split('/')[1].replace('.svg', '');
      const user = await getDocument<PublicUser>(`users/${userId}`);
      if (!!user) {
        if (user.watermark.ref === f.name) {
          console.log('This should not have happened if migration 29 went well..');
        } else {
          if (await f.delete()) {
            deleted++;
          }
        }
      } else {
        if (await f.delete()) {
          deleted++;
        }
      }
    }
  });

  return { deleted, total: files.length };
}


// @TODO (#3175) rework
async function smartDelete(file: GFile, existingFiles: GFile[], pattern: string = '/promotionalElements.') {
  if (!file.name.includes(pattern)) {
    try {
      await file.delete();
      return 1;
    } catch (error) {
      return 0;
    }
  }

  // We try to delete all previous sizes
  let deleted = 0;
  const fileParts = file.name.split('/');
  const ressourcesPath = file.name.replace(`${fileParts[fileParts.length - 2]}/${fileParts[fileParts.length - 1]}`, '');

  for (const size of ['lg', 'md', 'xs', 'fallback', 'original']) {
    const customeSizePath = `${ressourcesPath}${size}`;
    if (!existingFiles.some(f => f.name.includes(customeSizePath))) {
      try {
        await file.delete();
        deleted++;
      } catch (error) {
        //
      }

    }
  }

  return deleted;
}