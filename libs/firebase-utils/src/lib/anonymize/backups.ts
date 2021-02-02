import { Bucket } from '@google-cloud/storage';

export async function getLatestFolderURL(backupBucket: Bucket, prefix?: string) {
  const folderName = await getLatestDirName(backupBucket, prefix);
  return `gs://${backupBucket.name}/${folderName}`;
}

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
  console.log(folder)
  return folder.folderName;
}
