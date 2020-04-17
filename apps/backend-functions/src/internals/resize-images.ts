const gcs = require('@google-cloud/storage')();
const os = require('os');
const path = require('path');

export async function onFileUploadEvent(event: any) {
  const object = event.data;
  const bucket = object.bucket;
  const contentType = object.contentType;
  const filePath = object.name;
  console.log('File change detected, function execution started');

  if (path.basename(filePath).startsWith('renamed--')) {
    console.log('We already renamed that file !');
    return;
  }


  const distBucket = gcs.bucket(bucket);
  const tmpFilePath = path.join(os.tmpdir(), path.basename(filePath));
  const metadata = { contentType };
  return distBucket.file(filePath).download({
    destination: tmpFilePath
  }).then(() => {
    return distBucket.upload(tmpFilePath, {
      destination: 'renamed-' + path.basename(filePath),
      metadata
    });
  })
}
