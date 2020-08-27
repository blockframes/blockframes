import { firebase } from 'env/env';
import { firebase as firebaseCI } from 'env/env.ci';
import { firebase as firebaseProd } from 'env/env.prod';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';
import { execSync } from 'child_process';

const CI_STORAGE_BACKUP = 'blockframes-ci-storage-backup';

export async function restoreStorageFromCi() {
  config();

  if (
    firebase.storageBucket === 'blockframes.appspot.com' ||
    firebase.storageBucket === firebaseProd.storageBucket
  )
    throw Error('ABORT: YOU ARE TRYING TO RUN SCRIPT AGAINST PROD - THIS WILL DELETE STORAGE!!');

  if (!('FIREBASE_CI_SERVICE_ACCOUNT' in process.env)) {
    throw new Error('Key "FIREBASE_CI_SERVICE_ACCOUNT" does not exist in .env');
  }

  type Cert = string | admin.ServiceAccount;
  let cert: Cert;
  try {
    // If service account is a stringified json object
    cert = JSON.parse(process.env.FIREBASE_CI_SERVICE_ACCOUNT as string);
  } catch (err) {
    // If service account is a path
    cert = process.env.FIREBASE_CI_SERVICE_ACCOUNT as admin.ServiceAccount;
  }

  const ci = admin.initializeApp(
    {
      storageBucket: CI_STORAGE_BACKUP,
      projectId: firebaseCI.projectId,
      credential: admin.credential.cert(cert),
    },
    'CI-app'
  );

  try {
    const ciStorage = ci.storage();
    // @ts-ignore
    const [files, nextQuery, apiResponse] = await ciStorage.bucket(CI_STORAGE_BACKUP).getFiles({
      autoPaginate: false,
      delimiter: '/',
    });
    const folders = apiResponse.prefixes as string[];
    // ! There is no such thing as a folder - these are GCS prefixes: https://googleapis.dev/nodejs/storage/latest/Bucket.html#getFiles
    const latestFolder = folders
      .map((folderName) => {
        let [day, month, year] = folderName.split('-').slice(-3);
        year = year.substr(0, 4);
        return {
          folderName,
          date: new Date(`${month}-${day}-${year}`),
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
