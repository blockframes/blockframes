import { firebase } from '@env'
import { initializeApp } from 'firebase-admin'
import { clearFirestoreData } from '@firebase/rules-unit-testing'
import { ClearFirestoreDataOptions } from '@firebase/rules-unit-testing/dist/src/api';
import { ChildProcess, execSync } from 'child_process';
import { Dirent, existsSync, mkdirSync, readdirSync, rmdirSync, writeFileSync, renameSync } from 'fs';
import { join, resolve, sep } from 'path';
import { runShellCommand, runShellCommandUntil, awaitProcOutput, runInBackground } from '../commands';
import { getFirestoreExportDirname } from './export';
import { sleep } from '../util';

const firestoreExportFolder = 'firestore_export'; // ! Careful - changing this may cause a bug

export const getFirestoreExportPath = (emulatorPath: string) => join(emulatorPath, firestoreExportFolder);
export const getEmulatorMetadataJsonPath = (emulatorPath: string) => join(emulatorPath, 'firebase-export-metadata.json');

/**
 * This function will get the filename of the Firestore export metadata json file.
 * @param firestorePath absolute path to a Firestore export
 */
function getFirestoreMetadataJsonFilename(firestorePath: string) {
  const fileSearch: Dirent[] = readdirSync(firestorePath, { withFileTypes: true });
  return fileSearch.find((file) => file.isFile()).name;
}

/**
 * This is a "default" path used by scripts and commands to store Firestore backups when running
 * various processes, such as PFT or db anonymization.
 */
export const defaultEmulatorBackupPath = join(process.cwd(), '.firebase', 'emulator');

/**
 * This function will download and convert a Firestore export saved in a GCS bucket to
 * a local format compatible with the Firebase emulator.
 * @param gcsPath full GCS bucket URI to Firestore export
 * @param emulatorBackupPath local path to root Firebase emulator export directory
 */
export async function importFirestoreEmulatorBackup(gcsPath: string, emulatorBackupPath: string) {
  await downloadFirestoreBackup(gcsPath, emulatorBackupPath);
  createEmulatorMetadataJson(emulatorBackupPath);
}

/**
 * This function will simply start the Firebase emulator with correct flags to import
 * Firestore backup on startup, and return a `ChildProcess` object of the running emulator.
 *
 * This promise resolves when it detects that the emulator has started and is ready.
 * @param emuPath path to the root Firebase emulator export
 */
export async function startFirestoreEmulatorWithImport(emuPath: string) {
  const cmd = `firebase emulators:start --only firestore --import ${emuPath} --export-on-exit`;
  console.log('Running command:', cmd);
  const { proc, procPromise } = runShellCommandUntil(cmd, 'All emulators ready');
  process.on('SIGINT', async () => await shutdownEmulator(proc));
  await procPromise;
  return proc;
}

/**
 * This helper function will download a Firestore export from a GCS bucket and
 * save it inside a folder structure compatible with a local Firestore emulator
 * @param gcsPath The full GCS bucket URI pointing to the online Firestore export
 * @param emulatorBackupPath absolute path to the root Firebase emulator directory
 */
export function downloadFirestoreBackup(gcsPath: string, emulatorBackupPath: string) {
  const firestoreBackupPath = getFirestoreExportPath(emulatorBackupPath);
  const trailingSlash = gcsPath.charAt(gcsPath.length - 1) === '/';
  if (!existsSync(emulatorBackupPath)) mkdirSync(firestoreBackupPath, { recursive: true });
  else {
    rmdirSync(emulatorBackupPath, { recursive: true });
    mkdirSync(firestoreBackupPath, { recursive: true });
  }

  const cmd = `gsutil -m cp -r "${gcsPath}${trailingSlash ? '*' : '/*'}"  "${firestoreBackupPath}"`;
  console.log('Running command:', cmd);
  return runShellCommand(cmd);
}

/**
 * This function will generate a Firestore emulator metadata file when given a directory
 * that contains a Firestore export. This is necessary for converting live Firestore backups
 * to local emulator-readable format.
 * @param emuPath path to the root emulator export folder
 */
function createEmulatorMetadataJson(emuPath: string) {
  const firestorePath = getFirestoreExportPath(emuPath);
  if (!isFirestoreBackupDir(firestorePath)) throw Error('Cannot find valid metadata file/Firestore export dir');
  const firebaseVersion = execSync('firebase -V').toString().split('\n').shift();
  const firestoreEmulatorVersion = '1.11.7';

  const fileSearch: Dirent[] = readdirSync(firestorePath, { withFileTypes: true });
  const firestoreMetadataFile = fileSearch.find((file) => file.isFile()).name;

  const emulatorObj = {
    version: firebaseVersion,
    firestore: {
      version: firestoreEmulatorVersion,
      path: firestoreExportFolder,
      metadata_file: join(firestoreExportFolder, firestoreMetadataFile),
    },
  };

  const emulatorMetadataJsonPath = getEmulatorMetadataJsonPath(emuPath);
  writeFileSync(emulatorMetadataJsonPath, JSON.stringify(emulatorObj, null, 4), 'utf-8');
}

/**
 * This function returns a promise that will resolve when the emulator has
 * successfully shut down.
 * @param proc the `ChildPRocess` object for the running emulator process.
 * @param timeLimit number of seconds to await gracefull shutdown before SIGKILL
 */
export async function shutdownEmulator(proc: ChildProcess, timeLimit: number = 60 * 2) {
  proc.kill('SIGTERM');
  const emuP = awaitProcOutput(proc, 'Stopping Logging Emulator').then(() => true);
  const timeP = sleep(1000 * timeLimit).then(() => false);
  const emuTerminated = await Promise.race([emuP, timeP]);
  return emuTerminated || proc.kill('SIGKILL');
}

export interface FirestoreEmulator extends FirebaseFirestore.Firestore {
  clearFirestoreData(options: ClearFirestoreDataOptions): Promise<void>
}

/**
 * This is a helper function that will return a Firestore db object connected to
 * the local emulator. It also adds on a fast`clearFirestoreData` method for
 * clearing the local emulator.
 */
export function connectEmulator(): FirestoreEmulator {
  if (firebase().projectId === 'blockframes') throw Error('YOU ARE ON PROD!!');
  const db = initializeApp(firebase(), 'emulator').firestore() as any;
  const firebaseJsonPath = resolve(process.cwd(), 'firebase.json')
  // tslint:disable-next-line: no-eval
  const { emulators: { firestore: { port } } } = eval('require')(firebaseJsonPath);
  db.settings({
    port,
    merge: true,
    ignoreUndefinedProperties: true,
    host: 'localhost',
    ssl: false,
  });
  process.env['FIRESTORE_EMULATOR_HOST'] = `localhost:${port}`
  db.clearFirestoreData = clearFirestoreData;
  return db as FirestoreEmulator;
}

/**
 * This function will process a local firestore export and upload it to a storage bucket.
 * The metadata format for GCS firestore backups is slightly different, and the foldername must match the
 * metadata filename, and so this function ensures these conditions are met, and then uploads the converted
 * export to a bucket with the correct directory name.
 *
 * @param param0 object provides three settings -  `bucketName`, `remoteDir`, `localPath`.
 *
 * The `bucketName` is the name of the bucket without the URI prefix (gs://).
 *
 * `remoteDir` is the name of the directory to upload to in specified bucket, without a trailing slash.
 *
 * `localPath` is the local relative or absolute path where to find a FIRESTORE (not Firebase emulator) backup folder
 */
export async function uploadDbBackupToBucket({ bucketName, remoteDir, localPath }: { bucketName: string; remoteDir?: string; localPath?: string; }) {
  console.log('Uploading local Firestore backup to bucket. Converting from emulator format to Firestore format.');
  console.log('Bucket:', bucketName);

  const firestoreExportAbsPath = localPath
    ? resolve(localPath)
    : getFirestoreExportPath(defaultEmulatorBackupPath);
  console.log('Local Firestore backup directory path:', firestoreExportAbsPath);
  if (!isFirestoreBackupDir(firestoreExportAbsPath)) throw Error('Firestore backup metadata file not found.');

  const firestoreMetadataFilename = getFirestoreMetadataJsonFilename(firestoreExportAbsPath);
  const firestoreMetadataAbsPath = join(firestoreExportAbsPath, firestoreMetadataFilename);

  remoteDir = remoteDir ?? getFirestoreExportDirname(new Date);
  console.log('Remote directory:', remoteDir)

  // * Must rename metadata file to have same name as containing directory when uploaded
  const newFirestoreMetaFilename = `${remoteDir.split(sep).pop()}.overall_export_metadata`;
  const newFirestoreMetadataAbsPath = join(firestoreExportAbsPath, newFirestoreMetaFilename);
  renameSync(firestoreMetadataAbsPath, newFirestoreMetadataAbsPath);

  // * Find parent folder and update Firebase emulator backup metadata file in case we want to use it again in emulator
  const folderArray = firestoreExportAbsPath.split(sep);
  const firestoreFolderName = folderArray.pop();
  const parentFolderAbsPath = folderArray.join(sep);
  const emulatorMetadataJsonPath = getEmulatorMetadataJsonPath(parentFolderAbsPath);
  // tslint:disable-next-line: no-eval
  const emulatorMetaData = eval('require')(emulatorMetadataJsonPath);
  emulatorMetaData.firestore.metadata_file = join(firestoreFolderName, newFirestoreMetaFilename);
  writeFileSync(emulatorMetadataJsonPath, JSON.stringify(emulatorMetaData, null, 4), 'utf-8');

  let cmd = `gsutil -m rm -r "gs://${bucketName}/${remoteDir}"`;
  console.log('Running command:', cmd);
  if (!remoteDir) throw Error('remoteDir is empty... this will clear the entire bucket!');
  let output = await runInBackground(cmd).procPromise;
  console.log(output);

  cmd = `gsutil -m cp -r "${firestoreExportAbsPath}" "gs://${bucketName}/${remoteDir}"`;
  console.log('Running command:', cmd);
  output = await runInBackground(cmd).procPromise;
  console.log(output);
}

export function isFirestoreBackupDir(backupDir: string) {
  const fileSearch: Dirent[] = readdirSync(resolve(backupDir), { withFileTypes: true });
  let metadataFile: string;
  try {
    metadataFile = fileSearch.find((file) => file.isFile()).name;
  } catch (e) {
    return false;
  }
  return metadataFile.split('.').pop() === 'overall_export_metadata';
}

export function isEmulatorBackupDir(backupDir: string) {
  const fileSearch: Dirent[] = readdirSync(resolve(backupDir), { withFileTypes: true });
  let metadataFile: string;
  try {
    metadataFile = fileSearch.find((file) => file.isFile()).name;
  } catch (e) {
    return false;
  }
  if (metadataFile !== 'firebase-export-metadata.json') return false;
  // tslint:disable-next-line: no-eval
  const emulatorMetaData = eval('require')(resolve(backupDir, metadataFile));
  const firestoreBackupDir = resolve(backupDir, emulatorMetaData.firestore.path);

  if (!existsSync(resolve(backupDir, emulatorMetaData.firestore.metadata_file))) return false;

  if (isFirestoreBackupDir(firestoreBackupDir)) return true;
}
