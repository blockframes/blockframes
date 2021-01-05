import { firebase } from '@env'
import { initializeApp } from 'firebase-admin'
import { clearFirestoreData } from '@firebase/rules-unit-testing'
import { ClearFirestoreDataOptions } from '@firebase/rules-unit-testing/dist/src/api';
import { ChildProcess, execSync } from 'child_process';
import { Dirent, existsSync, mkdirSync, readdirSync, rmdirSync, writeFileSync, renameSync} from 'fs';
import { join, resolve, sep} from 'path';
import { runShellCommand, runShellCommandUntil, awaitProcOutput } from '../commands';

const firestoreExportFolder = 'firestore_export';

const getFirestoreExportPath = (emulatorPath: string) => join(emulatorPath, firestoreExportFolder);
const getEmulatorMetadataJsonPath = (emulatorPath: string) =>join(emulatorPath, 'firebase-export-metadata.json');

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
export const defaultEmulatorBackupPath = resolve(process.cwd(), 'tmp', 'emulator');

/**
 * This function will download and convert a Firestore export saved in a GCS bucket to
 * a local format compatible with the Firebase emulator.
 * @param gcsPath full GCS bucket URI to Firestore export
 * @param emulatorBackupPath local path to root Firebase emulator export directory
 */
export async function importPrepareFirestoreEmulatorBackup(gcsPath: string, emulatorBackupPath: string) {
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
  process.on('SIGINT', async () => (await shutdownEmulator(proc)))
  await procPromise;
  return proc;
}

/**
 * This helper function will download a Firestore export from a GCS bucket and
 * save it inside a folder structure compatible with a local Firestore emulator
 * @param gcsPath The full GCS bucket URI pointing to the online Firestore export
 * @param emuPath absolute path to the root Firebase emulator directory
 */
export function downloadFirestoreBackup(gcsPath: string, emuPath: string) {
  const firestorePath = getFirestoreExportPath(emuPath);
  const trailingSlash = gcsPath.charAt(gcsPath.length - 1) === '/';
  if (!existsSync(emuPath)) mkdirSync(firestorePath, { recursive: true });
  else {
    rmdirSync(emuPath, { recursive: true });
    mkdirSync(firestorePath, { recursive: true });
  }

  const cmd = `gsutil -m cp -r "${gcsPath}${trailingSlash ? '*' : '/*'}"  "${firestorePath}"`;
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
 */
export function shutdownEmulator(proc: ChildProcess) {
  proc.kill('SIGINT');
  return awaitProcOutput(proc, 'Stopping Logging Emulator');
}

export interface FirestoreEmulator extends FirebaseFirestore.Firestore {
 clearFirestoreData(options: ClearFirestoreDataOptions): Promise<void>
}

/**
 * This is a helper function that will return a Firestore db object connected to
 * the local emulator. It also adds on a fast`clearFirestoreData` method for
 * clearing the local emulator.
 */
export function connectEmulator(): FirestoreEmulator  {
  if (firebase().projectId === 'blockframes') throw Error('YOU ARE ON PROD!!');
  const db = initializeApp(firebase(), 'emulator').firestore() as any;
  const firebaseJsonPath = resolve(process.cwd(), 'firebase.json')
  // tslint:disable-next-line: no-eval
  const { emulators: { firestore: { port }} } = eval('require')(firebaseJsonPath)
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
export function uploadDbBackupToBucket({ bucketName, remoteDir, localPath }: { bucketName: string; remoteDir?: string; localPath?: string; }) {
  const firestoreExportAbsPath = localPath
    ? join(process.cwd(), localPath)
    : getFirestoreExportPath(defaultEmulatorBackupPath);
  const firestoreMetadataFilename = getFirestoreMetadataJsonFilename(firestoreExportAbsPath);
  const firestoreMetadataAbsPath = join(firestoreExportAbsPath, firestoreMetadataFilename);

  const d = new Date();
  const _remoteDir = remoteDir || `firestore-backup-${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
  const newFirestoreMetaFilename = `${_remoteDir}.overall_export_metadata`
  const newFirestoreMetadataAbsPath = join(firestoreExportAbsPath, newFirestoreMetaFilename);
  renameSync(firestoreMetadataAbsPath, newFirestoreMetadataAbsPath);

  const folderArray = firestoreExportAbsPath.split(sep);
  const firestoreFolderName = folderArray.pop();
  const parentFolderAbsPath = folderArray.join(sep);
  const emulatorMetadataJsonPath = getEmulatorMetadataJsonPath(parentFolderAbsPath);
  // tslint:disable-next-line: no-eval
  const emulatorMetaData = eval('require')(emulatorMetadataJsonPath)
  emulatorMetaData.firestore.metadata_file = join(firestoreFolderName, newFirestoreMetaFilename)
  writeFileSync(emulatorMetadataJsonPath, JSON.stringify(emulatorMetaData, null, 4), 'utf-8');

  const cmd = `gsutil -m cp -r "${firestoreExportAbsPath}" "gs://${bucketName}/${_remoteDir}"`;
  console.log('Running command:', cmd)
  return runShellCommand(cmd);
}
