import { join } from 'path';
import { backupBucket } from 'env/env';
import { backupBucket as backupBucketCI } from 'env/env.blockframes-ci';
import * as admin from 'firebase-admin';
import { existsSync, mkdirSync } from 'fs';
import { catchErrors } from './util';
import { getLatestFolderURL } from './anonymize';

export const latestAnonDbFilename = 'LATEST-ANONYMIZED.jsonl'

export async function copyAnonDbFromCi(storage: admin.storage.Storage, ci: admin.app.App) {
  const folder = join(process.cwd(), 'tmp');

  return catchErrors(async () => {
    // Get latest backup DB
    const ciStorage = ci.storage();
    const last = await ciStorage.bucket(backupBucketCI).file(latestAnonDbFilename)

    console.log('Latest backup:', last?.metadata?.timeCreated);
    console.log('Remote name:', last?.name);
    console.log('File name: ', latestAnonDbFilename);
    console.log('File metadata is: ');
    console.dir(last?.metadata);
    console.log('Bucket name: ', last?.bucket?.name);

    // Ensure parent folder exist
    console.log(`Dest folder : ${folder}`);
    if (!existsSync(folder)) {
      mkdirSync(folder);
      console.log('Dest folder created');
    }

    // Download latest backup
    const destination = join(folder, latestAnonDbFilename);
    console.log(`Downloading latest backup to : ${destination}`);

    let downloadError = false;
    await last?.download({ destination }).catch((e) => {
      downloadError = true;
      console.log('There was an error while downloading backup..');
      console.log(e);
    });

    if (downloadError) {
      return null;
    }

    console.log('Backup have been saved to:', destination);

    const myBucket = storage.bucket(backupBucket);

    const result = await myBucket.upload(destination, { destination: last?.name });
    console.log('File uploaded as', result[0].name);
    return destination;
  });
}

export async function copyAnonBinDbFromCi(ci: admin.app.App) {
  let prodFirebase;
  let prodBackupBucket;
  let prodStorage;
  console.log('Production projectId: ', prodFirebase.projectId);
  console.log('Production backup bucket name: ', prodBackupBucket);
  const prodBackupBucketObj = prodStorage.bucket(prodBackupBucket);
  const prodDbURL = await getLatestFolderURL(prodBackupBucketObj);
  console.log('Production Firestore Backup URL:', prodDbURL);
}
