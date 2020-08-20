import { join } from 'path';
import { firebase, backupBucket } from 'env/env';
import { backupBucket as backupBucketCI, firebase as firebaseCI } from 'env/env.ci';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';
import { existsSync, mkdirSync } from 'fs';

export async function copyDbFromCi() {
  config();

  const folder = join(process.cwd(), 'tmp');

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
      storageBucket: backupBucketCI,
      projectId: firebaseCI.projectId,
      credential: admin.credential.cert(cert),
    },
    'CI-app'
  );

  const app = admin.initializeApp(
    {
      storageBucket: backupBucket,
      projectId: firebase.projectId,
      credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS as Cert),
    },
    'local-env'
  );

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
    console.log('Latest backup:', last?.metadata?.timeCreated);
    console.log('File name: ', last?.name);
    console.log('File metadata is: ');
    console.dir(last?.metadata);
    console.log('Bucket name: ', last?.bucket?.name);

    // Ensure parent folder exist
    if (!existsSync(folder)) {
      mkdirSync(folder);
    }

    if (!last?.name) throw Error();

    // Dowload lastest backup
    const destination = join(folder, last.name);
    await last?.download({ destination });
    console.log('Backup has been saved to:', destination);

    const storage = app.storage();
    const myBucket = storage.bucket(backupBucket);

    const result = await myBucket.upload(destination, { destination: last.name });
    console.log('File uploaded as', result[0].name);
  } catch (err) {
    if ('errors' in err) {
      err.errors.forEach((error: { message: any }) => console.error('ERROR:', error.message));
    } else {
      console.log(err);
    }
  }
}
