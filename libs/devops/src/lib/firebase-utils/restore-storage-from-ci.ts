import { firebase } from 'env/env';
import { firebase as firebaseProd } from 'env/env.blockframes';
import { gsutilTransfer } from './commands';
import { CI_ANONYMIZED_DATA, latestAnonStorageDir } from './utils';

const isProdBucket = (bucketName: string) => {
  return ['blockframes.appspot.com', firebaseProd().storageBucket].includes(bucketName);
}

export async function restoreAnonStorageFromCI() {
  if (isProdBucket(firebase().storageBucket)) {
    throw Error('ABORT: YOU ARE TRYING TO RUN SCRIPT AGAINST PROD - THIS WILL DELETE STORAGE!!');
  }

  console.log("Copying prepared storage bucket from blockframe-ci to your local project's storage bucket...");
  await gsutilTransfer({
    quiet: true,
    mirror: true,
    from: `gs://${CI_ANONYMIZED_DATA}/${latestAnonStorageDir}`,
    to: `gs://${firebase().storageBucket}`,
  });
}
