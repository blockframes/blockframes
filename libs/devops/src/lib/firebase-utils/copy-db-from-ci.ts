import { backupBucket } from '@env';
import { gsutilTransfer } from './commands';
import { CI_ANONYMIZED_DATA, latestAnonDbDir } from './utils';

export async function copyFirestoreExportFromCiBucket(dbBackupURL?: string) {
  if (!dbBackupURL && CI_ANONYMIZED_DATA as unknown === backupBucket) {
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

  const anonBackupURL = dbBackupURL || `gs://${CI_ANONYMIZED_DATA}/${latestAnonDbDir}`;
  const localBucketURL = `gs://${backupBucket}/${importFirestoreDirName}`;

  console.log('Copying golden data from CI. From\n', anonBackupURL, ' To:\n', localBucketURL);
  await gsutilTransfer({ rsync: true, mirror: true, from: anonBackupURL, to: localBucketURL });
}
