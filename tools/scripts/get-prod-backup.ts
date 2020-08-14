import { backupBucket, firebase } from '../../env/env.prod';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';
config();

if (!('FIREBASE_PRODUCTION_SERVICE_ACCOUNT' in process.env)) {
  throw new Error('Key "FIREBASE_PRODUCTION_SERVICE_ACCOUNT" does not exist in .env');
}

let cert: string | admin.ServiceAccount;
try {
  // If service account is a stringified json object
  cert = JSON.parse(process.env.FIREBASE_PRODUCTION_SERVICE_ACCOUNT);
} catch (err) {
  // If service account is a path
  cert = process.env.FIREBASE_PRODUCTION_SERVICE_ACCOUNT;
}

admin.initializeApp({
  storageBucket: backupBucket,
  projectId: firebase.projectId,
  credential: admin.credential.cert(cert),
});
const storage = admin.storage();
const folder = join(process.cwd(), 'tmp');

async function getProdBackup() {
  console.log('Current projectId: ', firebase.projectId);
  console.log('Current backup bucket name: ', backupBucket);
  try {
    // Get latest backup DB
    const [files] = await storage.bucket(backupBucket).getFiles();
    const last = files.sort((a, b) => a.metadata?.timeCreated - b.metadata?.timeCreated).pop();
    console.log('Latest backup:', last.metadata.timeCreated);
    console.log('File name: ', last.name);
    console.dir('File metadata is: ', last.metadata);
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

getProdBackup().then(() => process.exit(0));
