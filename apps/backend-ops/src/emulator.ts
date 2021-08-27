import {
  shutdownEmulator,
  importFirestoreEmulatorBackup,
  defaultEmulatorBackupPath,
  runAnonymization,
  getLatestFolderURL,
  getServiceAccountObj,
  uploadDbBackupToBucket,
  loadAdminServices,
  restoreStorageFromCi,
  startMaintenance,
  latestAnonDbDir,
  getFirestoreExportPath,
  getBackupBucket,
  CI_STORAGE_BACKUP,
  latestAnonStorageDir,
  gsutilTransfer,
  awaitProcessExit,
  firebaseEmulatorExec,
  connectAuthEmulator,
  connectFirestoreEmulator,
  endMaintenance
} from '@blockframes/firebase-utils';
import { ChildProcess } from 'child_process';
import { join, resolve } from 'path';
import { backupBucket as prodBackupBucket, firebase as prodFirebase } from 'env/env.blockframes';
import admin from 'firebase-admin'
import { backupBucket, firebase } from '@env'
import { migrate } from './migrations';
import { generateWatermarks, syncUsers } from './users';
import { cleanDeprecatedData } from './db-cleaning';
import { cleanStorage } from './storage-cleaning';
import { openSync } from 'fs';

/**
 * This function will download the Firestore backup from specified bucket, import it into
 * the emulator and run the emulator without shutting it down. This command can be used to run
 * emulator in background while developing or running other processes.
 * @param bucketUrl GCS bucket URL for the Firestore backup
 *
 * If no parameter is provided, it will attempt to find the latest backup out of a number
 * of date-formatted directory names in the env's backup bucket (if there are multiple dated backups)
 */
export async function importEmulatorFromBucket(_exportUrl: string) {
  const bucketUrl = _exportUrl || await getLatestFolderURL(loadAdminServices().storage.bucket(backupBucket), 'firestore');
  await importFirestoreEmulatorBackup(bucketUrl, defaultEmulatorBackupPath);
  let proc: ChildProcess;
  try {
    proc = await firebaseEmulatorExec({
      emulators: 'firestore',
      importPath: defaultEmulatorBackupPath,
      exportData: true,
    });
    await awaitProcessExit(proc);
  } catch (e) {
    await shutdownEmulator(proc);
    throw e;
  }
}

export interface StartEmulatorOptions {
  importFrom: 'defaultImport' | string,
}

/**
 * This function will load the Firestore emulator from a default local path, or use the
 * path provided as an argument without downloading anything from a GCS bucket.
 * Not much use over manually running the command, other than less flags...
 * @param param0 this is a relative path to local Firestore backup to import into emulator
 */
export async function loadEmulator({ importFrom = 'defaultImport' }: StartEmulatorOptions) {
  const emulatorPath = importFrom === 'defaultImport' ? defaultEmulatorBackupPath : join(process.cwd(), importFrom);
  let proc: ChildProcess;
  try {
    proc = await firebaseEmulatorExec({ emulators: 'firestore', importPath: emulatorPath, exportData: true });
    await awaitProcessExit(proc);
  } catch (e) {
    await shutdownEmulator(proc)
    throw e;
  }
}

export async function startEmulators({ importFrom = 'defaultImport' }: StartEmulatorOptions = { importFrom :'defaultImport' }) {
  const emulatorPath = importFrom === 'defaultImport' ? defaultEmulatorBackupPath : resolve(importFrom);
  let proc: ChildProcess;
  try {
    proc = await firebaseEmulatorExec({
      emulators: ['functions', 'firestore', 'pubsub'],
      importPath: emulatorPath,
      exportData: true
    })
    // ! Sync Auth here live from DB. Subsequent exports will not work... fix by removing auth component from backup
    // ! This means we must delete auth from backup when we need the backup if auth is used... we never do this?
    // ! because in prepare... we dont launch auth, we just sync real auth... but we dont need to. we can just
    // ! sync auth on emulator launch live from emulator data. ensure amulator auth is set only when needed!
    // ! when syncing auth, defs enable maintenance mode... the triggerKill method can't help us during this!
    // ! if we launch auth here... this is not used elsewhere... like this is frontend only. So we just have to connect to it
    // ! other functiosn will not all have auth happen as long as we only enable it when needed.
    // ! emulator connect needs fixing, but furst test if premise works....
    // const auth = connectAuthEmulator();
    // const db = connectFirestoreEmulator();
    // await startMaintenance(db)
    // await syncUsers(null, db, auth)
    // await endMaintenance(db)
    // openSync(join(emulatorPath, '.ready'), 'w');
    await awaitProcessExit(proc);
  } catch (e) {
    await shutdownEmulator(proc)
    throw e;
  }
}

/**
 * This function will find the latest production backup based on date in folder name,
 * and download it to the local default folder or specified path.
 */
export async function downloadProdDbBackup(localPath?: string) {
  if (!('FIREBASE_PRODUCTION_SERVICE_ACCOUNT' in process.env)) {
    throw new Error('Key "FIREBASE_PRODUCTION_SERVICE_ACCOUNT" does not exist in .env');
  }
  const cert = getServiceAccountObj(process.env.FIREBASE_PRODUCTION_SERVICE_ACCOUNT);

  const prodApp = admin.initializeApp(
    {
      storageBucket: prodBackupBucket,
      projectId: prodFirebase().projectId,
      credential: admin.credential.cert(cert),
    },
    'production'
  );
  const prodStorage = prodApp.storage();
  console.log('Production projectId: ', prodFirebase().projectId);
  console.log('Production backup bucket name: ', prodBackupBucket);
  const prodBackupBucketObj = prodStorage.bucket(prodBackupBucket);
  const prodDbURL = await getLatestFolderURL(prodBackupBucketObj, 'firestore');
  console.log('Production Firestore Backup URL:', prodDbURL);
  await importFirestoreEmulatorBackup(prodDbURL, localPath || defaultEmulatorBackupPath);
}

/**
 * This function will run db anonymization on a locally running Firestore emulator database
 */
export async function anonDbProcess() {
  const db = connectFirestoreEmulator();
  const { getCI, storage, auth } = loadAdminServices();
  const o = await db.listCollections();
  if (!o.length) throw Error('THERE IS NO DB TO PROCESS - DANGER!');
  console.log(o.map((snap) => snap.id));

  console.info('Preparing database & storage by running migrations...');
  await migrate({ withBackup: false, db, storage }); // run the migration, do not trigger a backup before, since we already have it!
  console.info('Migrations complete!');

  console.log('Running anonymization...');
  await runAnonymization(db);
  console.log('Anonymization complete!')

  console.info('Syncing users from db...');
  const p1 = syncUsers(null, db);

  console.info('Syncing storage with production backup stored in blockframes-ci...');
  const p2 = restoreStorageFromCi(getCI());

  await Promise.all([p1, p2]);
  console.info('Storage synced!');
  console.info('Users synced!');

  console.info('Cleaning unused DB data...');
  await cleanDeprecatedData(db, auth);
  console.info('DB data clean and fresh!');

  console.info('Cleaning unused storage data...');
  await cleanStorage(await getBackupBucket(storage));
  console.info('Storage data clean and fresh!');

  console.info('Generating watermarks...');
  await generateWatermarks({db, storage});
  console.info('Watermarks generated!');
}

/**
 * This will download latest prod db and run the anonymization process in one command,
 * then shut down the local emulator. If you would like to view the db, you can run
 * `loadEmulator` afterwards to start the Firestore emulator with import from default path
 */
export async function anonymizeLatestProdDb() {
  await downloadProdDbBackup(defaultEmulatorBackupPath);
  const proc = await firebaseEmulatorExec({
    emulators: 'firestore',
    importPath: defaultEmulatorBackupPath,
    exportData: true,
  });
  try {
    await anonDbProcess();
  } finally {
    await shutdownEmulator(proc, defaultEmulatorBackupPath);
  }
  console.log('Storing golden database data');
  await uploadBackup({ localRelPath: getFirestoreExportPath(defaultEmulatorBackupPath), remoteDir: latestAnonDbDir });

  console.log('Storing golden storage data');
  const anonBucketBackupDirURL = `gs://${CI_STORAGE_BACKUP}/${latestAnonStorageDir}/`;
  await gsutilTransfer({ from: `gs://${firebase().storageBucket}`, to: anonBucketBackupDirURL, mirror: true, quiet: true, });
}

/**
 * This function takes a local path to the Firestore export (not Firebae emulator backup)
 * and remote directory name (NOT URI) and uploads the Firestore export to the local env's
 * backup bucket after converting it back to the live Firestore format.
 * @param param0 settings object for `localRelPath` and `remoteDir`
 */
export async function uploadBackup({ localRelPath, remoteDir }: { localRelPath?: string; remoteDir?: string; } = {}) {
  await uploadDbBackupToBucket({ bucketName: backupBucket, localPath: localRelPath, remoteDir });
}

/**
 * This function will launch the emulator and switch on maintenance mode, then exit
 * @param param0 settings object
 * Provide a local path to the firestore export dir for which to switch on maintenance mode
 */
export async function enableMaintenanceInEmulator({ importFrom = 'defaultImport' }: StartEmulatorOptions) {
  const emulatorPath = importFrom === 'defaultImport' ? defaultEmulatorBackupPath : join(process.cwd(), importFrom);
  let emulatorProcess: ChildProcess;
  try {
    emulatorProcess = await firebaseEmulatorExec({
      emulators: 'firestore',
      importPath: emulatorPath,
      exportData: true,
    });
    const db = connectFirestoreEmulator();
    startMaintenance(db);
  } finally {
    await shutdownEmulator(emulatorProcess);
  }
}
