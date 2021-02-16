import type { Bucket } from '@google-cloud/storage';

/**
 * This is the same as `getLatestDirName()` except it returns the full GCS URI rather
 * than just the directory name.
 * @param backupBucket bucket to be searched
 * @param prefix optional prefix to filter search by
 */
export async function getLatestFolderURL(backupBucket: Bucket, prefix?: string) {
  const folderName = await getLatestDirName(backupBucket, prefix);
  return `gs://${backupBucket.name}/${folderName}`;
}

/**
 * This function will return the name of a directory that is found to have the most
 * recent date as part of it's name. This follows the following directory name format
 * or naming convention: `prefix-export-dd-mm-yyyy`. The optional prefix can be used to
 * filter different kinds of exports. The date on the end is read to find the most recently
 * generated folder.
 * @param backupBucket GCS bucket object that will be searched
 * @param prefix optional prefix (dash separated '-') to filter folder names by
 */
export async function getLatestDirName(backupBucket: Bucket, prefix?: string) {
  const [, , apiResponse] = await backupBucket.getFiles({ autoPaginate: false, delimiter: '/' });
  const folders = apiResponse.prefixes as string[];
  // ! There is no such thing as a folder - these are GCS prefixes: https://googleapis.dev/nodejs/storage/latest/Bucket.html#getFiles
  const folder = folders
    .map((fName) => {
      try {
        const [day, month, year] = fName.split('-').slice(-3);
        const firstWord = fName.split('-').shift();
        const output = {
          folderName: fName,
          date: new Date(`${month}-${day}-${year.substr(0, 4)}`),
        };
        if (!prefix) return output;
        else if (firstWord === prefix) return output;
        return;
      } catch (e) {
        console.error(e);
        return;
      }
    })
    .sort((a, b) => Number(a.date) - Number(b.date))
    .filter(obj => obj)
    .pop();
  return folder.folderName;
}
