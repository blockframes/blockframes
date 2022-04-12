import { backupBucket, firebase } from '@env';
import { enableMaintenanceInEmulator } from './emulator';
import { clearDb, getLatestDirName, gsutilTransfer, loadAdminServices, runShellCommandExec } from '@blockframes/firebase-utils';
import { defaultEmulatorBackupPath, importFirestoreEmulatorBackup, uploadDbBackupToBucket } from '@blockframes/firebase-utils/firestore/emulator';
import { deleteAllUsers } from '@blockframes/testing/unit-tests';
import { ensureMaintenanceMode } from './tools';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs, upgradeAlgoliaUsers } from './algolia';

export const getFirebaseBackupDirname = (d: Date) => `firebase-backup-${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;

/**
 * This function creates a backup of a Firebase project
 * @param dirName name of backup dir - optional - will use date instead
 */
export async function backupLiveEnv(dirName?: string) {
  const backupDir = dirName || getFirebaseBackupDirname(new Date());
  const backupURL = `gs://${backupBucket}/${backupDir}`;

  const firestoreURL = `${backupURL}/firestore`;
  const storageURL = `${backupURL}/storage`;
  const authURL = `${backupURL}`;

  let cmd: string;

  console.log(`backing up Firestore to ${firestoreURL}`);
  cmd = `gcloud firestore export --project ${firebase().projectId} ${firestoreURL}`;
  await runShellCommandExec(cmd);

  console.log(`backing up storage to ${storageURL}`);
  await gsutilTransfer({ from: `gs://${firebase().storageBucket}`, to: storageURL, quiet: true });

  console.log(`backing up auth to ${authURL}`);
  cmd = `firebase auth:export -P ${firebase().projectId} ./tmp/auth-backup.json`;
  await runShellCommandExec(cmd);

  await gsutilTransfer({ rsync: false, from: './tmp/auth-backup.json', to: authURL });

  console.log('Firebase backup done!');
}

/**
 * This function will restore an env back to a live Firestore project from backup
 * It will also run Algolia sync scripts for that projectId
 * @param dirName name of backup dir in GCS Bucket
 */
export async function restoreLiveEnv(dirName?: string) {
  console.log('When restoring an entire env, this function will check your local environment vars for AUTH_KEY');
  console.log('You can find this key in your project, and this function will fail without it');
  if (!process.env['AUTH_KEY']) throw 'No AUTH_KEY found in env...';

  const { storage, db, auth } = loadAdminServices();
  const bucket = storage.bucket(backupBucket);
  const backupDir = dirName ? `${dirName}/` : await getLatestDirName(bucket, 'firebase');

  const backupURL = `gs://${backupBucket}/${backupDir}`;

  const firestoreURL = `${backupURL}firestore`;
  const storageURL = `${backupURL}storage`;
  const authURL = `${backupURL}auth-backup.json`;

  let cmd: string;

  console.log('Clearing existing env!');

  console.log('Ensuring maintenance mode stays enabled');
  const maintenanceInsurance = await ensureMaintenanceMode(db);

  console.log('Clearing Firestore...');
  await clearDb(db);

  console.log('Clearing auth...');
  await deleteAllUsers(auth);

  console.log('Old env data is now cleared');

  console.log('Enabling maintenance in backup...');
  await importFirestoreEmulatorBackup(firestoreURL, defaultEmulatorBackupPath);
  await enableMaintenanceInEmulator({ importFrom: 'defaultImport' });
  try {
    await uploadDbBackupToBucket({ bucketName: backupBucket, remoteDir: `${backupDir}firestore` });
  } catch (e) {
    console.warn(e);
  }

  console.log('Importing Firestore');
  cmd = `gcloud firestore import ${firestoreURL}`;
  await runShellCommandExec(cmd);

  console.log('Importing storage');
  await gsutilTransfer({ from: `${storageURL}`, to: `gs://${firebase().storageBucket}`, mirror: true, quiet: true });

  console.log('Importing auth');
  await gsutilTransfer({ from: authURL, to: './tmp/', rsync: false });

  cmd = `firebase auth:import --hash-algo SCRYPT --hash-key ${process.env.AUTH_KEY} --mem-cost 14 --rounds 8 --salt-separator Bw== ./tmp/auth-backup.json`;
  await runShellCommandExec(cmd);

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs();
  await upgradeAlgoliaMovies();
  await upgradeAlgoliaUsers();
  console.info('Algolia ready!');

  maintenanceInsurance();
}
