import { firebase } from '@env'
import { initializeApp } from 'firebase-admin'
import { clearFirestoreData } from '@firebase/rules-unit-testing'
import { ClearFirestoreDataOptions } from '@firebase/rules-unit-testing/dist/src/api';
import { ChildProcess, execSync } from 'child_process';
import { Dirent, existsSync, mkdirSync, readdirSync, rmdirSync, writeFileSync, renameSync} from 'fs';
import { join, resolve, sep} from 'path';
import { runShellCommand, runShellCommandUntil, awaitProcOutput } from '../commands';

const firestoreBackupFolder = 'firestore_export';

const getFirestoreBackupPath = (emulatorPath: string) => join(emulatorPath, firestoreBackupFolder);
const getEmulatorMetadataJsonPath = (emulatorPath: string) =>join(emulatorPath, 'firebase-export-metadata.json');

function getFirestoreMetadataJsonFilename(firestorePath: string) {
  const fileSearch: Dirent[] = readdirSync(firestorePath, { withFileTypes: true });
  return fileSearch.find((file) => file.isFile()).name;
}

export const defaultEmulatorBackupPath = resolve(process.cwd(), 'tmp', 'emulator');

export async function importPrepareFirestoreEmulatorBackup(gcsPath: string, emulatorBackupPath: string) {
  await downloadFirestoreBackup(gcsPath, emulatorBackupPath);
  createEmulatorMetadataJson(emulatorBackupPath);
}

export async function startFirestoreEmulatorWithImport(emuPath: string) {
  const cmd = `firebase emulators:start --only firestore --import ${emuPath} --export-on-exit`;
  console.log('Running command:', cmd);
  const { proc, procPromise } = runShellCommandUntil(cmd, 'All emulators ready');
  process.on('SIGINT', async () => (await shutdownEmulator(proc)))
  await procPromise;
  return proc;
}

export function downloadFirestoreBackup(gcsPath: string, emuPath: string) {
  const firestorePath = getFirestoreBackupPath(emuPath);
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

function createEmulatorMetadataJson(emuPath: string) {
  const firestorePath = getFirestoreBackupPath(emuPath);
  const firebaseVersion = execSync('firebase -V').toString().split('\n').shift();
  const firestoreEmulatorVersion = '1.11.7';

  const fileSearch: Dirent[] = readdirSync(firestorePath, { withFileTypes: true });
  const firestoreMetadataFile = fileSearch.find((file) => file.isFile()).name;

  const emulatorObj = {
    version: firebaseVersion,
    firestore: {
      version: firestoreEmulatorVersion,
      path: firestoreBackupFolder,
      metadata_file: join(firestoreBackupFolder, firestoreMetadataFile),
    },
  };

  const emulatorMetadataJsonPath = getEmulatorMetadataJsonPath(emuPath);
  writeFileSync(emulatorMetadataJsonPath, JSON.stringify(emulatorObj, null, 4), 'utf-8');
}

export function shutdownEmulator(proc: ChildProcess) {
  proc.kill('SIGINT');
  return awaitProcOutput(proc, 'Stopping Logging Emulator');
}

export interface FirestoreEmulator extends FirebaseFirestore.Firestore {
 clearFirestoreData(options: ClearFirestoreDataOptions): Promise<void>
}

export function connectEmulator(): FirestoreEmulator  {
  if (firebase.projectId === 'blockframes') throw Error('YOU ARE ON PROD!!');
  const db = initializeApp(firebase, 'emulator').firestore() as any;
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

export function uploadDbBackupToBucket({ bucketName, remoteDir, localPath }: { bucketName: string; remoteDir?: string; localPath?: string; }) {
  const absFirestoreBackupPath = localPath
    ? join(process.cwd(), localPath)
    : getFirestoreBackupPath(defaultEmulatorBackupPath);
  const metaFilename = getFirestoreMetadataJsonFilename(absFirestoreBackupPath);
  const metaAbsPath = join(absFirestoreBackupPath, metaFilename);

  const d = new Date();
  const _remoteDir = remoteDir || `firestore-backup-${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
  const newFirestoreMetaFilename = `${_remoteDir}.overall_export_metadata`
  const newFirestoreMetadataAbsPath = join(absFirestoreBackupPath, newFirestoreMetaFilename);
  renameSync(metaAbsPath, newFirestoreMetadataAbsPath);

  const folderArray = absFirestoreBackupPath.split(sep);
  const firestoreFolderName = folderArray.pop();
  const parentFolderAbsPath = folderArray.join(sep);
  const emulatorMetadataJsonPath = getEmulatorMetadataJsonPath(parentFolderAbsPath);
  // tslint:disable-next-line: no-eval
  const emulatorMetaData = eval('require')(emulatorMetadataJsonPath)
  emulatorMetaData.firestore.metadata_file = join(firestoreFolderName, newFirestoreMetaFilename)
  writeFileSync(emulatorMetadataJsonPath, JSON.stringify(emulatorMetaData, null, 4), 'utf-8');

  const cmd = `gsutil -m cp -r "${absFirestoreBackupPath}" "gs://${bucketName}/${_remoteDir}"`;
  console.log('Running command:', cmd)
  return runShellCommand(cmd);
}
