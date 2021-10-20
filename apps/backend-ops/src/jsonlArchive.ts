import { restoreFromBackupBucket } from '@blockframes/firebase-utils';
import { syncUsers } from './users';
import { exportFirestoreToBucket, getBackupBucket, } from '@blockframes/firebase-utils';
import { last } from 'lodash';
import { loadDBVersion, selectAndOrderMigrations, updateDBVersion } from './migrations';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs, upgradeAlgoliaUsers } from './algolia';
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
  await migrateOld(false); // run the migration, do not trigger a backup before, since we already have it!
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
}

export async function upgradeOld() {
  const { db, auth, storage } = loadAdminServices();

  console.info('Preparing the database...');
  await migrateOld(true);
  console.info('Database ready for deploy!');

  console.info('Cleaning unused db data...');
  await cleanDeprecatedData(db, auth);
  console.info('DB data clean and fresh!');

  console.info('Cleaning unused storage data...');
  await cleanStorage(storage.bucket(storageBucket));
  console.info('Storage data clean and fresh!');

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs();
  await upgradeAlgoliaMovies();
  await upgradeAlgoliaUsers();
  console.info('Algolia ready for testing!');
}


export async function migrateOld(
  withBackup = true,
  db = loadAdminServices().db,
  storage = loadAdminServices().storage
) {
  console.info('start the migration process...');

  try {
    const currentVersion = await loadDBVersion(db);
    const migrations = selectAndOrderMigrations(currentVersion);

    if (migrations.length === 0) {
      console.info('No migrations to run, leaving...');
      return;
    }

    if (withBackup) {
      console.info('backup the database before doing anything');
      await backup();
      console.info('backup done, moving on to the migrations...');
    } else {
      console.warn('⚠️ skipping the backup before running migrations, are you sure?');
    }

    const lastVersion = last(migrations).version;

    console.info(`Running migrations: ${migrations.map((x) => x.version).join(', ')}`);

    for (const migration of migrations) {
      console.info(`applying migration: ${migration.version}`);
      await migration.upgrade(db, storage);
      console.info(`done applying migration: ${migration.version}`);
    }

    await updateDBVersion(db, lastVersion);
  } catch (e) {
    console.error(e);
    console.error("the migration failed, revert'ing!");
    await restore();
    throw e;
  } finally {
    if (withBackup) {
      console.info('running a backup post-migration');
      await backup();
      console.info('done with the backup post-migration');
    }
    console.info('end the migration process...');
  }
}


/**
 * Trigger a firestore database backup operation for the given project
 * @deprecated
 */

export async function backup() {
  const { db, storage } = loadAdminServices();
  return exportFirestoreToBucket(db, await getBackupBucket(storage));
}


/**
 * Trigger a firestore database restore operation for the given project
 * @deprecated
 */

export async function restore(file?: string) {
  const { db, storage } = loadAdminServices();
  return restoreFromBackupBucket(await getBackupBucket(storage), db, file);
}
