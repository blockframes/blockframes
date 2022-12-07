import { syncUsers } from './users';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs, upgradeAlgoliaUsers } from './algolia';
import { migrate, updateAppVersion } from './migrations';
import { importFirestore } from './admin';
import { endMaintenance, startMaintenance } from '@blockframes/firebase-utils';
import {
  defaultEmulatorBackupPath,
  firebaseEmulatorExec,
  importFirestoreEmulatorBackup,
  shutdownEmulator,
} from './firebase-utils/firestore/emulator';
import { cleanDeprecatedData } from './db-cleaning';
import { cleanStorage } from './storage-cleaning';
import { firebase } from '@env';
import { generateFixtures } from './generate-fixtures';
import { ensureMaintenanceMode, isMigrationRequired } from './tools';
import { backupBucket as ciBucketName } from 'env/env.blockframes-ci';
import { EIGHT_MINUTES_IN_MS } from '@blockframes/utils/maintenance';
import { copyFirestoreExportFromCiBucket, latestAnonDbDir, restoreAnonStorageFromCI } from './firebase-utils';
import { getAuth, getAuthEmulator, getDb, getFirestoreEmulator, getStorage } from '@blockframes/firebase-utils/initialize';
import { appVersion } from '@blockframes/utils/constants';

const { storageBucket } = firebase();

export async function prepareForTesting({ dbBackupURL }: { dbBackupURL?: string } = {}) {

  const storage = getStorage();
  const db = getDb();
  const auth = getAuth();

  const maintenanceInsurance = await ensureMaintenanceMode(db); // Enable maintenance insurance

  console.log('Copying AnonDb from CI...');
  await copyFirestoreExportFromCiBucket(dbBackupURL);
  console.log('Copied!');

  console.log('Clearing Firestore db and importing latest anonymized db...');
  let importFirestoreDirName: string; // ! Cleanest temp hack to make this work with other dirnames
  if (dbBackupURL) {
    importFirestoreDirName = dbBackupURL.split('/').slice(3).join('/');
  } else {
    importFirestoreDirName = latestAnonDbDir;
  }
  await importFirestore(importFirestoreDirName);
  console.log('DB imported!');

  console.info('Syncing users from db...');
  await syncUsers({ db, auth });
  console.info('Users synced!');

  console.info('Syncing storage with blockframes-ci...');
  await restoreAnonStorageFromCI();
  console.info('Storage synced!');

  console.info('Preparing database & storage by running migrations...');
  await migrate({ db, storage, withBackup: false });
  console.info('Migrations complete!');

  console.info('Generating fixtures...');
  await generateFixtures(db);
  console.info('Fixtures generated in: tools/fixtures/*.json');

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs(null, db);
  await upgradeAlgoliaMovies(null, db);
  await upgradeAlgoliaUsers(db);
  console.info('Algolia ready for testing!');

  maintenanceInsurance(); // Switch off maintenance insurance
  await endMaintenance(db, EIGHT_MINUTES_IN_MS);
}

export async function prepareEmulators({ dbBackupURL }: { dbBackupURL?: string } = {}) {
  console.log('Importing golden Firestore DB data from CI...');
  const _dbBackupURL = dbBackupURL ?? `gs://${ciBucketName}/${latestAnonDbDir}`;
  await importFirestoreEmulatorBackup(_dbBackupURL, defaultEmulatorBackupPath);
  console.log('Done!');

  const proc = await firebaseEmulatorExec({
    emulators: ['auth', 'firestore'],
    importPath: defaultEmulatorBackupPath,
    exportData: true,
  });
  const storage = getStorage();
  const db = getFirestoreEmulator();
  const auth = getAuthEmulator();
  const maintenanceInsurance = await ensureMaintenanceMode(db); // Enable maintenance insurance

  console.info('Syncing users from db...');
  await syncUsers({ db, auth });
  console.info('Users synced!');

  console.info('Syncing storage with blockframes-ci...');
  await restoreAnonStorageFromCI();
  console.info('Storage synced!');

  console.info('Preparing database & storage by running migrations...');
  await migrate({ db, storage, withBackup: false });
  console.info('Migrations complete!');

  console.info('Generating fixtures...');
  await generateFixtures(db);
  console.info('Fixtures generated in: tools/fixtures/*.json');

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs(null, db);
  await upgradeAlgoliaMovies(null, db);
  await upgradeAlgoliaUsers(db);
  console.info('Algolia ready for testing!');

  maintenanceInsurance(); // Switch off maintenance insurance
  await endMaintenance(db, EIGHT_MINUTES_IN_MS);
  await shutdownEmulator(proc);
}

export async function upgrade() {
  const db = getDb();
  const auth = getAuth();
  const storage = getStorage();

  await updateAppVersion(db, appVersion);

  if (!await isMigrationRequired(db)) {
    console.log('Skipping upgrade because migration is not required...');
    return;
  }
  await startMaintenance(db);

  console.info('Preparing the database...');
  await migrate({ withBackup: true, db, storage, performMigrationCheck: false });
  console.info('Database ready for deploy!');

  console.info('Cleaning unused db data...');
  await cleanDeprecatedData(db, auth);
  console.info('DB data clean and fresh!');

  console.info('Cleaning unused storage data...');
  await cleanStorage(storage.bucket(storageBucket));
  console.info('Storage data clean and fresh!');

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs(null, db);
  await upgradeAlgoliaMovies(null, db);
  await upgradeAlgoliaUsers(db);
  console.info('Algolia ready for testing!');

  await endMaintenance(db);
}

export async function upgradeEmulators() {
  const db = getFirestoreEmulator();
  if (!await isMigrationRequired(db)) {
    console.log('Skipping upgrade because migration is not required...');
    return;
  }
  const storage = getStorage();
  const maintenanceInsurance = await ensureMaintenanceMode(db); // Enable maintenance insurance

  console.info('Preparing the database...');
  await migrate({ withBackup: false, db, storage, performMigrationCheck: false });
  console.info('Database ready for deploy!');

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs(null, db);
  await upgradeAlgoliaMovies(null, db);
  await upgradeAlgoliaUsers(db);
  console.info('Algolia ready for testing!');

  maintenanceInsurance(); // Switch off maintenance insurance
  await endMaintenance(db, EIGHT_MINUTES_IN_MS);
}
