import readline from 'readline';
import type { Bucket, File as GFile } from '@google-cloud/storage';
import admin from 'firebase-admin';
import { isArray, isEqual, isPlainObject, sortBy } from 'lodash';
import { runChunks } from '../firebase-utils';
import { endMaintenance, setImportRunning, startMaintenance } from '../maintenance';
import { JsonlDbRecord } from '../util';
import { clear } from './clear';

const KEYS_TIMESTAMP = sortBy(['_seconds', '_nanoseconds']);

export async function restoreFromBackupBucket(bucket: Bucket, db: FirebaseFirestore.Firestore) {
  // We get the backup file before clearing the db, just in case.
  const files: GFile[] = (await bucket.getFiles())[0];
  const sortedFiles: GFile[] = sortBy(files, ['name']);

  if (sortedFiles.length === 0) throw new Error('Nothing to restore');

  const lastFile: GFile = sortedFiles[sortedFiles.length - 1];

  console.log('Setting maintenance and activating import flag');
  await startMaintenance();
  await setImportRunning(true);

  console.log('Clearing the database');
  await clear(db);

  await importFirestoreFromGFile(lastFile, db);

  await setImportRunning(false);
  await endMaintenance();
}

export async function importFirestoreFromGFile(firestoreBackupFile: GFile, db: FirebaseFirestore.Firestore) {
  console.log('restoring file:', firestoreBackupFile.name);
  const stream = firestoreBackupFile.createReadStream();
  const lineReader = readline.createInterface({
    input: stream,
    terminal: false
  });


  const readerDone = new Promise(resolve => {
    lineReader.on('close', resolve);
  });

  stream.on('end', () => {
    lineReader.close();
  });

  const lines: any[] = [];
  lineReader.on('line', line => {
    lines.push(line);
  });

  await readerDone;

  await importFirestoreBackup(lines, db)

  console.log(`Done processing: ${lines.length - 1} lines loaded`);
}

export async function importFirestoreBackup(jsonl: JsonlDbRecord[], db: FirebaseFirestore.Firestore) {
  return runChunks( jsonl, async (line: any) => {
      const stored: JsonlDbRecord = JSON.parse(line);
      if (stored.docPath !== '_META/_MAINTENANCE') {
        await db.doc(stored.docPath).set(reEncodeObject(stored.content));
      }
  }, 500, false);
}

/**
 * Take a json object and re-encode its content to match our firebase storage.
 *
 * For example: transform {_second, _nanoseconds} objects back to firestore timestamps
 * objects.
 *
 * @param x the object to reencode
 * @returns a new object
 */
function reEncodeObject(x: any): any {
  if (isArray(x)) {
    // array: recursive descent for each item (used in steps object for example)
    return x.map(reEncodeObject);
  } else if (isPlainObject(x)) {
    const keys = Object.keys(x);

    if (isEqual(sortBy(keys), KEYS_TIMESTAMP)) {
      // We have a timestamp object, re-encode
      return new admin.firestore.Timestamp(x._seconds, x._nanoseconds);
    } else {
      // else: recursive descent
      const r: any = {};
      keys.forEach(k => {
        r[k] = reEncodeObject(x[k]);
      });
      return r;
    }
  } else {
    return x;
  }
}
