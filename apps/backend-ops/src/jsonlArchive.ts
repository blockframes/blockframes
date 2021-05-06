import { syncUsers, generateWatermarks } from './users';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs, upgradeAlgoliaUsers } from './algolia';
import { migrate } from './migrations';
import { restore } from './admin';
import { latestAnonDbFilename, loadAdminServices } from "@blockframes/firebase-utils";
import { cleanDeprecatedData } from './db-cleaning';
import { cleanStorage } from './storage-cleaning';
import { copyAnonDbFromCi, readJsonlFile, restoreStorageFromCi } from '@blockframes/firebase-utils';
import { generateFixtures } from './generate-fixtures';
import { firebase } from '@env';
const { storageBucket } = firebase();


export async function prepareForTestingOld() {
  const { db, auth, storage, getCI } = loadAdminServices();

  console.log('Fetching anonymized DB from blockframes-ci and uploading to local storage bucket...');
  const dbBackupPath = await copyAnonDbFromCi(storage, getCI());
  if (!dbBackupPath)
    throw Error('Unable to download Firestore backup from blockframes-ci bucket');
  console.log('DB copied to local bucket!');

  console.info(`Syncing users from : ${dbBackupPath} ...`);
  await syncUsers(readJsonlFile(dbBackupPath));
  console.info('Users synced!');

  console.info('DB backup in local storage bucket is being restored into Firestore...');
  await restore(latestAnonDbFilename);
  console.info('Backup restored!');

  console.info('Syncing storage with production backup stored in blockframes-ci...');
  await restoreStorageFromCi(getCI());
  console.info('Storage synced!');

  console.info('Preparing database & storage by running migrations...');
  await migrate(false); // run the migration, do not trigger a backup before, since we already have it!
  console.info('Migrations complete!');

  console.info('Cleaning unused DB data...');
  await cleanDeprecatedData(db, auth);
  console.info('DB data clean and fresh!');

  console.info('Cleaning unused storage data...');
  await cleanStorage(storage.bucket(storageBucket));
  console.info('Storage data clean and fresh!');

  console.info('Generating fixtures...');
  await generateFixtures();
  console.info('Fixtures generated in: tools/fixtures/*.json');

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs();
  await upgradeAlgoliaMovies();
  await upgradeAlgoliaUsers();
  console.info('Algolia ready for testing!');

  console.info('Generating watermarks...');
  await generateWatermarks();
  console.info('Watermarks generated!');

}
