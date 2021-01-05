import {
  shutdownEmulator,
  importPrepareFirestoreEmulatorBackup,
  startFirestoreEmulatorWithImport,
  connectEmulator,
  defaultEmulatorBackupPath,
  runAnonymization,
  getLatestFolderURL,
  getServiceAccountObj,
  uploadDbBackupToBucket,
  loadAdminServices
} from '@blockframes/firebase-utils';
import { ChildProcess } from 'child_process';
import { resolve } from 'path';
import { backupBucket as prodBackupBucket, firebase as prodFirebase } from 'env/env.blockframes';
import admin from 'firebase-admin'
import { backupBucket } from '@env'

/**
 * This function will download the Firestore backup from specified bucket, import it into
 * the emulator and run the emulator without shutting it down. This command can be used to run
 * emulator in background while developing or running other processes.
 * @param bucketUrl GCS bucket URL for the Firestore backup
 *
 * If no parameter is provided, it will attempt to find the latest backup out of a number
 * of date-formatted directory names in the env's backup bucket (if there are multiple dated backups)
 */
export async function importEmulatorFromBucket(_bucketUrl: string) {
  const bucketUrl = _bucketUrl
    ? _bucketUrl
    : await getLatestFolderURL(loadAdminServices().storage.bucket(backupBucket));
  await importPrepareFirestoreEmulatorBackup(bucketUrl, defaultEmulatorBackupPath);
  let proc: ChildProcess;
  try {
    proc = await startFirestoreEmulatorWithImport(defaultEmulatorBackupPath);
    await new Promise(() => {});
  } catch (e) {
    await shutdownEmulator(proc);
    throw e;
  }
}

export interface StartEmulatorOptions {
  importFrom: 'defaultImport' | string
}

/**
 * This function will load the Firestore emulator from a default local path, or use the
 * path provided as an argument without downloading anything from a GCS bucket.
 * Not much use over manually running the command, other than less flags...
 * @param param0 this is a relative path to local Firestore backup to import into emulator
 */
export async function loadEmulator({ importFrom = 'defaultImport' }: StartEmulatorOptions) {
  const emulatorPath = importFrom === 'defaultImport' ? defaultEmulatorBackupPath : resolve(process.cwd(), importFrom);
  let proc: ChildProcess;
  try {
    proc = await startFirestoreEmulatorWithImport(emulatorPath);
    await new Promise(() => {});
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
    { storageBucket: prodBackupBucket,
      projectId: prodFirebase().projectId,
      credential: admin.credential.cert(cert),
    }, 'production');
  const prodStorage = prodApp.storage();
  console.log('Production projectId: ', prodFirebase().projectId);
  console.log('Production backup bucket name: ', prodBackupBucket);
  const prodBackupBucketObj = prodStorage.bucket(prodBackupBucket);
  const prodDbURL = await getLatestFolderURL(prodBackupBucketObj);
  console.log('Production Firestore Backup URL:', prodDbURL);
  await importPrepareFirestoreEmulatorBackup(prodDbURL, localPath || defaultEmulatorBackupPath);
}

/**
 * This function will run db anonymization on a locally running Firestore emulator database
 */
export async function anonDbLocal() {
  const db = connectEmulator();
  const o = await db.listCollections();
  console.log(o.map((snap) => snap.id));
  await runAnonymization(db);
}

/**
 * This will download latest prod db and run the anonymization process in one command,
 * then shut down the local emulator. If you would like to view the db, you can run
 * `loadEmulator` afterwards to start the Firestore emulator with import from default path
 */
export async function anonymizeLatestProdDb() {
  await downloadProdDbBackup(defaultEmulatorBackupPath)
  const proc = await startFirestoreEmulatorWithImport(defaultEmulatorBackupPath);
  try {
    await anonDbLocal();
  } catch (e) {
    throw e;
  } finally {
    await shutdownEmulator(proc);
  }
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
