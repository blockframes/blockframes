import { backupBucket } from '@env';
import { backupBucket as ciBucketName } from 'env/env.blockframes-ci'
import { gsutilTransfer } from './commands';

export const latestAnonDbDir = 'LATEST-ANON-DB';

export const latestAnonShrinkedDbDir = 'LATEST-ANON-SHRINKED-DB';

export async function copyFirestoreExportFromCiBucket(dbBackupURL?: string) {
  if (!dbBackupURL && ciBucketName as unknown === backupBucket) {
    console.log('Skipping copying of DB to local bucket since it\'s already in the local CI bucket since we are in CI')
    return;
  }

  // ? We check to ensure the receiving dirName matches where it was copied from. Trailing slash may break this.
  let importFirestoreDirName: string; // ! Cleanest temp hack to make this work with other dirnames
  if (dbBackupURL) {
    importFirestoreDirName = dbBackupURL.split('/').slice(3).join('/');
  } else {
    importFirestoreDirName = latestAnonDbDir;
  }

  const anonBackupURL = dbBackupURL || `gs://${ciBucketName}/${latestAnonDbDir}`;
  const localBucketURL = `gs://${backupBucket}/${importFirestoreDirName}`;

  console.log('Copying golden data from CI. From\n', anonBackupURL, ' To:\n', localBucketURL);
  await gsutilTransfer({ rsync: true, mirror: true, from: anonBackupURL, to: localBucketURL });
}
