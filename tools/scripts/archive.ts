// tslint:disable: no-console
import 'tsconfig-paths/register';
import { backupBucket, firebase } from 'env/env.blockframes';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';
import { getServiceAccountObj, getLatestFile } from '@blockframes/firebase-utils';
import { readFileSync, writeFileSync } from 'fs';
import { loadAdminServices, catchErrors, latestAnonDbFilename } from '@blockframes/firebase-utils';
import { resolve } from 'path';
import { anonymizeDocument, DbRecord, getPathOrder } from '@blockframes/firebase-utils';

export function anonymizeJsonlDb() {
  // First argument
  const src = resolve(process.cwd(), process.argv[2] || 'tmp/backup-prod.jsonl');
  // Second argument
  const dest = resolve(process.cwd(), process.argv[3] || 'tmp/restore-ci.jsonl');
  const file = readFileSync(src, 'utf-8');
  const msg = 'Db anonymization time';
  console.time(msg);
  const db: DbRecord[] = file
    .split('\n')
    .filter((str) => !!str)
    .map((str) => JSON.parse(str) as DbRecord);
  const output = db
    .sort((a, b) => getPathOrder(a.docPath) - getPathOrder(b.docPath))
    .map((json) => anonymizeDocument(json))
    .map((result) => JSON.stringify(result))
    .join('\n');
  writeFileSync(dest, output, 'utf-8');
  console.timeEnd(msg);
}




export function uploadAnonDbToCI() {
  const ciStorage = loadAdminServices().getCI().storage();
  const restore = join(process.cwd(), 'tmp', 'restore-ci.jsonl');

  async function uploadDB() {
    // Ensure parent folder exist
    if (!existsSync(restore)) {
      throw new Error(`File ${restore} doesn't exist.`);
    }
    const destination = latestAnonDbFilename;
    await ciStorage.bucket(backupBucket).upload(restore, { destination });
    console.log(`Restore DB has been saved to: gs://${backupBucket}/${destination}`);
  }

  catchErrors(uploadDB).then(() => process.exit(0));
}

export function getProdDbJsonlBackup() {
  config();

  if (!('FIREBASE_PRODUCTION_SERVICE_ACCOUNT' in process.env)) {
    throw new Error('Key "FIREBASE_PRODUCTION_SERVICE_ACCOUNT" does not exist in .env');
  }

  const cert = getServiceAccountObj(process.env.FIREBASE_PRODUCTION_SERVICE_ACCOUNT);

  admin.initializeApp({
    storageBucket: backupBucket,
    projectId: firebase().projectId,
    credential: admin.credential.cert(cert),
  });
  const storage = admin.storage();
  const folder = join(process.cwd(), 'tmp');

  async function getProdJsonlBackup() {
    console.log('Current projectId: ', firebase().projectId);
    console.log('Current backup bucket name: ', backupBucket);
    try {
      // Get latest backup DB
      const [files] = await storage
        .bucket(backupBucket)
        .getFiles({ prefix: new Date().getFullYear().toString() });
      const last = getLatestFile(files);
      console.log('Latest backup:', last.metadata.timeCreated);
      console.log('File name: ', last.name);
      console.log('File metadata is: ');
      console.dir(last.metadata);
      console.log('Bucket name: ', last.bucket.name);

      // Ensure parent folder exist
      if (!existsSync(folder)) {
        mkdirSync(folder);
      }

      // Dowload lastest backup
      const destination = join(folder, 'backup-prod.jsonl');
      await last.download({ destination });
      console.log('Backup has been saved to:', destination);
    } catch (err) {
      if ('errors' in err) {
        err.errors.forEach((error) => console.error('ERROR:', error.message));
      } else {
        console.log(err);
      }
    }
  }

  getProdJsonlBackup().then(() => process.exit(0));
}
