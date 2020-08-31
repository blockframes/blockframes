import { join } from 'path';
import { backupBucket } from 'env/env';
import { backupBucket as backupBucketCI } from 'env/env.ci';
import * as admin from 'firebase-admin';
import { existsSync, mkdirSync } from 'fs';

export async function copyDbFromCi(storage: admin.storage.Storage, ci: admin.app.App) {
  const folder = join(process.cwd(), 'tmp');

  try {
    // Get latest backup DB
    const ciStorage = ci.storage();
    const [files] = await ciStorage.bucket(backupBucketCI).getFiles();
    const last = files
      .sort(
        (a, b) =>
          Number(new Date(a.metadata?.timeCreated)) - Number(new Date(b.metadata?.timeCreated))
      )
      .pop();

    const metadata = last?.metadata;
    const fname = `${metadata.bucket}-${metadata.generation}.jsonl`;
    console.log('Latest backup:', last?.metadata?.timeCreated);
    console.log('Remote name:', last?.name);
    console.log('File name: ', fname);
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
    const destination = join(folder, fname);
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
  } catch (err) {
    if ('errors' in err) {
      err.errors.forEach((error: { message: any }) => console.error('ERROR:', error.message));
    } else {
      console.log(err);
    }
    return null;
  }
}
