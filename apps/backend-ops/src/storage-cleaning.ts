import { loadAdminServices } from './admin';
import { getStorageBucketName } from 'apps/backend-functions/src/internals/firebase';
import { File as GFile, Bucket } from '@google-cloud/storage';
import { MovieDocument, OrganizationDocument, PublicUser } from 'apps/backend-functions/src/data/types';
import { getDocument } from 'apps/backend-functions/src/data/internals'

// @TODO (#3175) temp 
// gsutil -m rsync -r gs://blockframes.appspot.com gs://blockframes-bruce.appspot.com 
// export ENV=dev && npx ng build backend-ops --configuration=dev

interface FileWithMovieDocument {
  file: GFile,
  movie: MovieDocument
}

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
  const files: GFile[] = (await bucket.getFiles({ prefix: 'movie/' }))[0];
  const filesToCheck: FileWithMovieDocument[] = [];
  let deleted = 0;

  for (const f of files) {
    if (f.name.split('/').length === 2) {
      // Clean files at "movie/" root
      await smartDelete(f, files);
      deleted++;
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await smartDelete(f, files)) {
        deleted++;
      }
    } else {
      const movieId = f.name.split('/')[1];
      // We check if the file is used before removing it
      const movie = await getDocument<MovieDocument>(`movies/${movieId}`);
      if (!!movie) {
        filesToCheck.push({ file: f, movie });
      } else {
        if (await smartDelete(f, files)) {
          deleted++;
        }
      }
    }
  }

  deleted = deleted + (await checkMovieRef(filesToCheck));
  return { deleted, total: files.length };
}

async function cleanMoviesDir(bucket: Bucket) {
  // Movie dir should not exists
  const files: GFile[] = (await bucket.getFiles({ prefix: 'movies/' }))[0];
  const filesToCheck: FileWithMovieDocument[] = [];
  let deleted = 0;

  for (const f of files) {
    if (f.name.split('/').length === 2) {
      // Clean files at "movies/" root
      await smartDelete(f, files);
      deleted++;
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await smartDelete(f, files)) {
        deleted++;
      }
    } else {
      const movieId = f.name.split('/')[1];
      const movie = await getDocument<MovieDocument>(`movies/${movieId}`);
      if (!!movie) {
        filesToCheck.push({ file: f, movie });
      } else {
        if (await smartDelete(f, files)) {
          deleted++;
        }
      }
    }
  }

  deleted = deleted + (await checkMovieRef(filesToCheck));
  return { deleted, total: files.length };
}

async function cleanOrgsDir(bucket: Bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'orgs/' }))[0];
  let deleted = 0;
  const pattern = '/logo';

  for (const f of files) {
    if (f.name.split('/').length === 2) {
      // Clean files at "orgs/" root
      await smartDelete(f, files, pattern);
      deleted++;
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await smartDelete(f, files, pattern)) {
        deleted++;
      }
    } else {
      const orgId = f.name.split('/')[1];
      const org = await getDocument<OrganizationDocument>(`orgs/${orgId}`);
      if (!!org) {
        if (org.logo.ref !== f.name) {
          if (await smartDelete(f, files, pattern)) {
            deleted++;
          }
        }
      } else {
        if (await smartDelete(f, files, pattern)) {
          deleted++;
        }
      }
    }
  }

  return { deleted, total: files.length };
}

async function cleanUsersDir(bucket: Bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'users/' }))[0];
  let deleted = 0;
  const pattern = '/avatar';

  for (const f of files) {
    if (f.name.split('/').length === 2 || f.name.split('/').length === 3 ) {
      // Clean files at "users/" or "user/{$userId}/" root
      await smartDelete(f, files, pattern);
      deleted++;
    } else if (f.name.split('/').pop().length >= 255) {
      // Cleaning files that have a too long name
      if (await smartDelete(f, files, pattern)) {
        deleted++;
      }
    } else {
      const userId = f.name.split('/')[1];
      const user = await getDocument<PublicUser>(`users/${userId}`);
      if (!!user) {
        if (user.avatar.ref !== f.name && user.watermark.ref !== f.name ) {
          if (await smartDelete(f, files, pattern)) {
            deleted++;
          }
        }
      } else {
        if (await smartDelete(f, files, pattern)) {
          deleted++;
        }
      }
    }
  }

  return { deleted, total: files.length };
}

/**
 * watermark dir is not used anymore
 * watermarks are in users/${userId}/watermark.svg
 * @param bucket 
 */
async function cleanWatermarkDir(bucket: Bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'watermark/' }))[0];
  let deleted = 0;

  for (const f of files) {
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
  }

  return { deleted, total: files.length };
}

async function checkMovieRef(filesToCheck: FileWithMovieDocument[]) {
  // Currently, the only ref saved in DB is the orignal one
  const originalFiles = filesToCheck.filter(f => f.file.name.includes('/original/'));
  const otherFiles = filesToCheck.filter(f => !f.file.name.includes('/original/'));

  let deleted = 0;
  for (const f of originalFiles) {
    if (isImageForMovie(f.file.name)) {
      if (!findImgRefInMovie(f.movie, f.file.name)) {
        // We only delete original, functions will delete the rest
        if (await smartDelete(f.file, originalFiles.map(ff => ff.file))) {
          deleted++;
        }
      }
    }
  }

  for (const f of otherFiles) {
    if (isPdfForMovie(f.file.name)) {

      const fileParts = f.file.name.split('/');
      const fileName = fileParts[fileParts.length - 1];

      // Pdf files are currently stored here 

      // @TODO (#3175) thanks to migration 0029, /PresentationDeck/ and /Scenario/ cases should not occur
      let pdfUrl = '';
      let stringToFind = '';
      if(f.file.name.includes('/PresentationDeck/') || f.file.name.includes('/promotionalElements.presentation_deck')) {
         pdfUrl = f.movie.promotionalElements.presentation_deck.media.url;
         stringToFind = f.file.name.includes('/PresentationDeck/') ? `movie%2F${f.movie.id}%2FPresentationDeck` : `movies%2F${f.movie.id}%2FpromotionalElements.presentation_deck.media%2F${fileName}`;
      } else {
        pdfUrl = f.movie.promotionalElements.scenario.media.url;
        stringToFind = f.file.name.includes('/Scenario/') ? `movie%2F${f.movie.id}%2FScenario` : `movies%2F${f.movie.id}%2FpromotionalElements.scenario.media%2F${fileName}`;
      }

      if (!pdfUrl || !pdfUrl.includes(stringToFind)) {
        if (await smartDelete(f.file, originalFiles.map(ff => ff.file))) {
          deleted++;
        }
      }

    } else if (!isImageForMovie(f.file.name)) {
      console.log(`Unhandled file : ${f.file.name}`);
      if (await smartDelete(f.file, originalFiles.map(ff => ff.file))) {
        deleted++;
      }
    }

  }
  return deleted;
}

function isImageForMovie(fileName: string): boolean {

  return fileName.includes('/promotionalElements.banner') ||
    fileName.includes('/promotionalElements.poster') ||
    fileName.includes('/promotionalElements.still_photo')
}

function isPdfForMovie(fileName: string): boolean {
  return fileName.includes('/PresentationDeck/') || // @TODO (#3175) not a good path, should not occur after next db migration
    fileName.includes('/Scenario/') || // @TODO (#3175) not a good path, should not occur after next db migration
    fileName.includes('/promotionalElements.presentation_deck') ||
    fileName.includes('/promotionalElements.scenario')
}

async function smartDelete(file: GFile, existingFiles: GFile[], pattern: string = '/promotionalElements.') {
  if (!file.name.includes(pattern)) {
    await file.delete();
    return true;
  }


  // We only delete original since the function will take care of the other sizes
  if (file.name.includes('/original/')) {
    await file.delete();
    return true;
  }

  // we check if the original exists
  const fileParts = file.name.split('/');
  const ressourcesPath = file.name.replace(`${fileParts[fileParts.length - 2]}/${fileParts[fileParts.length - 1]}`, '');
  const originalDirPath = `${ressourcesPath}original`;

  if (!existingFiles.some(f => f.name.includes(originalDirPath))) {
    await file.delete();
    return true;
  }

  return false;
}

function findImgRefInMovie(movie: MovieDocument, ref: string) {
  if (movie.main.banner.media.ref === ref) {
    return true;
  }

  if (movie.main.poster.media.ref === ref) {
    return true;
  }

  if (Object.values(movie.promotionalElements.still_photo).some(p => p.media.ref === ref)) {
    return true;
  }

  return false;
}