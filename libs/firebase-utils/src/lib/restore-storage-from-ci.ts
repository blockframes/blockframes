import { firebase } from 'env/env';
import { firebase as firebaseProd } from 'env/env.blockframes';
import * as admin from 'firebase-admin';
import { gsutilTransfer } from './commands';
import { getLatestDirName } from './anonymize';

export const CI_STORAGE_BACKUP = 'blockframes-ci-storage-backup';
export const latestAnonStorageDir = 'LATEST-ANON-STORAGE';

/**
 * This method is
 * @deprecated
 */
export async function restoreStorageFromCi(ciApp: admin.app.App) {
  if (
    firebase().storageBucket === 'blockframes.appspot.com' ||
    firebase().storageBucket === firebaseProd().storageBucket
  )
    throw Error('ABORT: YOU ARE TRYING TO RUN SCRIPT AGAINST PROD - THIS WILL DELETE STORAGE!!');

    const ciStorage = ciApp.storage();
    const folderName = await getLatestDirName(ciStorage.bucket(CI_STORAGE_BACKUP))
    console.log('Latest backup:', folderName);

    console.log("Mirroring backup prod-storage bucket from blockframe-ci to your local project's main storage bucket...");
    const exclude = 'protected.*.mp4$|protected.*.mov$|protected.*.mkv$|protected.*.3gpp$|protected.*.wmv$|protected.*.avi$';
    await gsutilTransfer({
      exclude,
      quiet: true,
      mirror: true,
      from: `gs://${CI_STORAGE_BACKUP}/${folderName}`,
      to: `gs://${firebase().storageBucket}`,
    });
}

export async function restoreAnonStorageFromCI() {
  if (
    firebase().storageBucket === 'blockframes.appspot.com' ||
    firebase().storageBucket === firebaseProd().storageBucket
  )
    throw Error('ABORT: YOU ARE TRYING TO RUN SCRIPT AGAINST PROD - THIS WILL DELETE STORAGE!!');

  console.log( "Copying prepared storage bucket from blockframe-ci to your local project's storage bucket...");
  await gsutilTransfer({
    quiet: true,
    mirror: true,
    from: `gs://${CI_STORAGE_BACKUP}/${latestAnonStorageDir}`,
    to: `gs://${firebase().storageBucket}`,
  });
}
