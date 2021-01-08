import { Bucket } from '@google-cloud/storage';

export async function getLatestFolderURL(backupBucket: Bucket) {
  const folderName = await getLatestDirName(backupBucket);
  return `gs://${backupBucket.name}/${folderName}`;
}

export async function getLatestDirName(backupBucket: Bucket) {
  const [, , apiResponse] = await backupBucket.getFiles({ autoPaginate: false, delimiter: '/' });
  const folders = apiResponse.prefixes as string[];
  // ! There is no such thing as a folder - these are GCS prefixes: https://googleapis.dev/nodejs/storage/latest/Bucket.html#getFiles
  const { folderName } = folders
    .map((prefix) => {
      const [day, month, year] = prefix.split('-').slice(-3);
      return {
        folderName: prefix,
        date: new Date(`${month}-${day}-${year.substr(0, 4)}`),
      };
    })
    .sort((a, b) => Number(a.date) - Number(b.date))
    .pop();
  return folderName;
}
