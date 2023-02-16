import { firebase } from 'env/env';
import { firebase as firebaseProd } from 'env/env.blockframes';
import { firebase as firebaseCI } from 'env/env.blockframes-ci';
import { gsutilTransfer } from './commands';
import { CI_ANONYMIZED_DATA, latestAnonStorageDir } from './utils';

const isProdBucket = (bucketName: string) => {
  return ['blockframes.appspot.com', firebaseProd().storageBucket].includes(bucketName);
}

export async function restoreAnonStorageFromCI() {
  if (isProdBucket(firebase().storageBucket)) {
    throw Error('ABORT: YOU ARE TRYING TO RUN SCRIPT AGAINST PROD - THIS WILL DELETE STORAGE!!');
  }

  if (firebase().projectId === firebaseCI().projectId) {
    console.log(`Skipping copy from ${CI_ANONYMIZED_DATA} to gs://${firebase().storageBucket} as ${firebaseCI().projectId} does not need storage files.`);
    return;
  }

  console.log(`Copying prepared storage bucket from ${CI_ANONYMIZED_DATA} to your local project's storage bucket...`);
  await gsutilTransfer({
    quiet: true,
    mirror: true,
    from: `gs://${CI_ANONYMIZED_DATA}/${latestAnonStorageDir}`,
    to: `gs://${firebase().storageBucket}`,
  });
}
