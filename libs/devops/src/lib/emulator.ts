import {
  getServiceAccountObj,
  startMaintenance,
  endMaintenance,
  getAuth,
  getAuthEmulator,
  getFirestoreEmulator,
  getStorage,
  initAdmin,
  initializeApp,
} from '@blockframes/firebase-utils';
import {
  shutdownEmulator,
  importFirestoreEmulatorBackup,
  defaultEmulatorBackupPath,
  uploadDbBackupToBucket,
  getFirestoreExportPath,
  firebaseEmulatorExec,
} from './firebase-utils/firestore/emulator';
import { ChildProcess } from 'child_process';
import { join, resolve } from 'path';
import { backupBucket as prodBackupBucket, firebase as prodFirebase } from 'env/env.blockframes';
import { backupBucket } from '@env';
import { migrate } from './migrations';
import { syncUsers } from './users';
import { cleanDeprecatedData } from './db-cleaning';
import {
  awaitProcessExit,
  gsutilTransfer,
  latestAnonDbDir,
  latestAnonStorageDir,
  CI_STORAGE_BACKUP,
  getLatestFolderURL,
  runAnonymization,
  getLatestDirName,
  CI_ANONYMIZED_DATA
} from './firebase-utils';
import { firebase as firebaseCI } from 'env/env.blockframes-ci';
import { credential } from 'firebase-admin';

interface ImportEmulatorOptions {
  importFrom: string;
}

/**
 * This function will download the Firestore backup from specified bucket, import it into
 * the emulator and run the emulator without shutting it down. This command can be used to run
 * emulator in background while developing or running other processes.
 * @param importFrom GCS bucket URL for the Firestore backup
 *
 * If no parameter is provided, it will attempt to find the latest backup out of a number
 * of date-formatted directory names in the env's backup bucket (if there are multiple dated backups)
 */
export async function importEmulatorFromBucket({ importFrom }: ImportEmulatorOptions) {
  const bucketUrl = importFrom || (await getLatestFolderURL(getStorage().bucket(backupBucket), 'firestore'));
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

interface StartEmulatorOptions {
  importFrom?: 'defaultImport' | string;
  emulators?: ('auth' | 'functions' | 'firestore' | 'pubsub' | 'storage')[];
  importData?: boolean;
  execCommand?: string
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
    await shutdownEmulator(proc);
    throw e;
  }
}

export async function startEmulators({
  importFrom = 'defaultImport',
  emulators = ['auth', 'functions', 'firestore', 'pubsub'],
  importData = true,
  execCommand
}: StartEmulatorOptions = { importFrom: 'defaultImport', importData: true, emulators: ['auth', 'functions', 'firestore', 'pubsub'] }) {
  const emulatorPath = importFrom === 'defaultImport' ? defaultEmulatorBackupPath : resolve(importFrom);
  let proc: ChildProcess;
  try {
    proc = await firebaseEmulatorExec({
      execCommand,
      emulators,
      importPath: importData ? emulatorPath : undefined,
      exportData: importData,
    });
    await awaitProcessExit(proc);
  } catch (e) {
    await shutdownEmulator(proc);
    throw e;
  }
}

/**
 * This creates users in Auth emulator from a running instance of the Firestore emulator
 * By keeping this clean and separate, we don't need to launch functions emulator when this is happening,
 * just Firestore and Auth. Cleaner and faster, less risk of triggers/leaks
 * This will shut down the emulator but the backup will contain a working version with Auth synched
 * IF AUTH GETS TOO BIG, THINGS WILL FAIL
 */
export async function syncAuthEmulatorWithFirestoreEmulator(
  { importFrom = 'defaultImport' }: StartEmulatorOptions = { importFrom: 'defaultImport' }
) {
  const emulatorPath = importFrom === 'defaultImport' ? defaultEmulatorBackupPath : resolve(importFrom);
  let proc: ChildProcess;
  try {
    proc = await firebaseEmulatorExec({
      emulators: ['auth', 'firestore'],
      importPath: emulatorPath,
      exportData: true,
    });
    const auth = getAuthEmulator();
    const db = getFirestoreEmulator();
    await startMaintenance(db);
    await syncUsers({ db, auth });
    await endMaintenance(db);
    await shutdownEmulator(proc);
  } catch (e) {
    await shutdownEmulator(proc);
    throw e;
  }
}

/**
 * This function will find the latest production backup based on date in folder name,
 * and download it to the local default folder or specified path.
 */
export async function downloadProdDbBackup(localPath?: string) {
  const productionGAPKey = `GAP_blockframes`;
  if (!(productionGAPKey in process.env)) {
    throw new Error(`Key "${productionGAPKey}" does not exist in .env`);
  }
  // * The below conversion to string is a hack we need because the type expected by cert() is not correct
  // * This is a firebase bug
  const cert = getServiceAccountObj(process.env[productionGAPKey]) as unknown as string;

  const prodApp = initializeApp(
    {
      storageBucket: prodBackupBucket,
      projectId: prodFirebase().projectId,
      credential: credential.cert(cert),
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
async function anonDbProcess() {
  const db = getFirestoreEmulator();
  const storage = getStorage();
  const auth = getAuth();
  const o = await db.listCollections();
  if (!o.length) throw Error('THERE IS NO DB TO PROCESS - DANGER!');
  console.log(o.map(snap => snap.id));

  console.info('Preparing database & storage by running migrations...');
  await migrate({ withBackup: false, db, storage }); // run the migration, do not trigger a backup before, since we already have it!
  console.info('Migrations complete!');

  console.log('Running anonymization...');
  await runAnonymization(db);
  console.log('Anonymization complete!');

  console.info('Syncing users from db...');
  await syncUsers({ db });
  console.info('Users synced!');

  console.info('Cleaning unused DB data...');
  await cleanDeprecatedData(db, auth);
  console.info('DB data clean and fresh!');
}

/**
 * This will download latest prod db and run the anonymization process in one command,
 * then shut down the local emulator. If you would like to view the db, you can run
 * `loadEmulator` afterwards to start the Firestore emulator with import from default path
 */
export async function anonymizeLatestProdDb() {
  await downloadProdDbBackup(defaultEmulatorBackupPath);
  let proc;
  try {
    proc = await firebaseEmulatorExec({
      emulators: 'firestore',
      importPath: defaultEmulatorBackupPath,
      exportData: true,
    });
    await anonDbProcess();
  } finally {
    await shutdownEmulator(proc, defaultEmulatorBackupPath, 30);
  }

  console.log('Storing golden database data');
  await uploadBackup({ localRelPath: getFirestoreExportPath(defaultEmulatorBackupPath), remoteDir: latestAnonDbDir });


  console.log('Storing golden storage data');
  const ciStorage = initAdmin(firebaseCI(), 'CI env').storage();
  const folderName = await getLatestDirName(ciStorage.bucket(CI_STORAGE_BACKUP));
  console.log('Latest backup:', folderName);

  // Extension list defined in libs/model/src/lib/utils.ts allowedFiles.video.extension
  const exclude = 'protected.*.mp4$|protected.*.mov$|protected.*.mkv$|protected.*.3gp$|protected.*.wmv$|protected.*.avi$|protected.*.m4v$|public.*.mp4$|public.*.mov$|public.*.mkv$|public.*.3gp$|public.*.wmv$|public.*.avi$|public.*.m4v$';
  await gsutilTransfer({
    exclude,
    quiet: true,
    mirror: true,
    from: `gs://${CI_STORAGE_BACKUP}/${folderName}`,
    to: `gs://${CI_ANONYMIZED_DATA}/${latestAnonStorageDir}/`,
  });
}

/**
 * This function takes a local path to the Firestore export (not Firebae emulator backup)
 * and remote directory name (NOT URI) and uploads the Firestore export to the local env's
 * backup bucket after converting it back to the live Firestore format.
 * @param param0 settings object for `localRelPath` and `remoteDir`
 */
export async function uploadBackup({ localRelPath, remoteDir }: { localRelPath?: string; remoteDir?: string } = {}) {
  await uploadDbBackupToBucket({ bucketName: backupBucket, localPath: localRelPath, remoteDir });
}
