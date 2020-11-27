import { ChildProcess, execSync } from 'child_process';
import { Dirent, existsSync, mkdirSync, readdirSync, rmdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { runShellCommand, runShellCommandUntil, waitForProcOutput } from '../commands';

const firestoreBackupFolder = 'firestore-data';
const getFirestoreBackupPath = (emulatorPath: string) => join(emulatorPath, firestoreBackupFolder);

export async function importPrepareFirestoreEmulatorBackup( gcsPath: string, emulatorBackupPath: string) {
  await downloadFirestoreBackup(gcsPath, emulatorBackupPath);
  createEmulatorMetadataJson(emulatorBackupPath);
}

export async function startFirestoreEmulatorWithImport(emuPath: string) {
  const cmd = `firebase emulators:start --only firestore --import ${emuPath} --export-on-exit`;
  console.log('Running command:', cmd);
  const { proc, procPromise } = runShellCommandUntil(cmd, 'All emulators ready');
  await procPromise;
  return proc;
}

export function downloadFirestoreBackup(gcsPath: string, emuPath: string) {
  const firestorePath = getFirestoreBackupPath(emuPath);
  if (!existsSync(emuPath)) mkdirSync(firestorePath, { recursive: true });
  else {
    rmdirSync(emuPath, { recursive: true });
    mkdirSync(firestorePath, { recursive: true });
  }

  const cmd = `gsutil -m cp -r "${gcsPath}/*"  "${firestorePath}"`;
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

  const emulatorMetadataJsonPath = join(emuPath, 'firebase-export-metadata.json');
  writeFileSync(emulatorMetadataJsonPath, JSON.stringify(emulatorObj, null, 4), 'utf-8');
}


export function gracefullyKillEmulator(proc: ChildProcess) {
  proc.kill('SIGINT');
  return waitForProcOutput(proc, 'Stopping Logging Emulator');
}
