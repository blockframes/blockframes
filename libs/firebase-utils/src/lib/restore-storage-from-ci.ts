import { firebase } from 'env/env';
import { firebase as firebaseProd } from 'env/env.prod';
import * as admin from 'firebase-admin';
import { execSync } from 'child_process';

const CI_STORAGE_BACKUP = 'blockframes-ci-storage-backup';

export async function restoreStorageFromCi(ciApp: admin.app.App) {
  if (
    firebase.storageBucket === 'blockframes.appspot.com' ||
    firebase.storageBucket === firebaseProd.storageBucket
  )
    throw Error('ABORT: YOU ARE TRYING TO RUN SCRIPT AGAINST PROD - THIS WILL DELETE STORAGE!!');

  try {
    const ciStorage = ciApp.storage();
    // @ts-ignore
    const [files, nextQuery, apiResponse] = await ciStorage.bucket(CI_STORAGE_BACKUP).getFiles({
      autoPaginate: false,
      delimiter: '/',
    });
    const folders = apiResponse.prefixes as string[];
    // ! There is no such thing as a folder - these are GCS prefixes: https://googleapis.dev/nodejs/storage/latest/Bucket.html#getFiles
    const latestFolder = folders
      .map((prefix) => {
        const [day, month, year] = prefix.split('-').slice(-3);
        return {
          folderName: prefix,
          date: new Date(`${month}-${day}-${year.substr(0, 4)}`),
        };
      })
      .sort((a, b) => Number(a.date) - Number(b.date))
      .pop();
    if (!latestFolder) throw Error('Unable to find latest backup folder');
    const { folderName } = latestFolder;
    console.log('Latest backup:', folderName);

    console.log('Clearing your storage bucket:', firebase.storageBucket);
    try {
      process.stdout.write(execSync(`gsutil -m rm -r "gs://${firebase.storageBucket}/*"`));
    } catch (e) {
      console.error(e);
    }
    console.log(
      "Copying storage bucket from blockframe-ci to your local project's storage bucket..."
    );
    const cmd = `gsutil -m cp -r gs://${CI_STORAGE_BACKUP}/${folderName}* gs://${firebase.storageBucket}`;
    console.log('Running command:', cmd);
    try {
      process.stdout.write(execSync(cmd));
    } catch (e) {
      console.error(e);
    }
  } catch (err) {
    if ('errors' in err) {
      err.errors.forEach((error: { message: any }) => console.error('ERROR:', error.message));
    } else {
      console.log(err);
    }
  }
}
