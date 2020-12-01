import { gracefullyKillEmulator, importPrepareFirestoreEmulatorBackup, startFirestoreEmulatorWithImport, waitForProcOutput } from '@blockframes/firebase-utils';
import { resolve } from 'path';


export async function importEmulatorFromBucket(bucketUrl: string) {
  const emulatorBackupPath = resolve(process.cwd(), 'tmp', 'test');
  await importPrepareFirestoreEmulatorBackup(bucketUrl, emulatorBackupPath)
  const proc = await startFirestoreEmulatorWithImport(emulatorBackupPath);
  await gracefullyKillEmulator(proc)
}

