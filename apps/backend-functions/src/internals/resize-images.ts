import { functions } from './firebase';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import * as gcs from '@google-cloud/storage';
import * as fs from 'fs-extra';
import sharp from 'sharp';

const storage = new gcs.Storage();

export async function onFileUploadEvent(data: functions.storage.ObjectMetadata) {
  // Get all the needed informations from the data (bucket, path, file name and directory)
  const bucket = storage.bucket(data.bucket);
  const filePath = data.name;

  if (!filePath) {
    return false;
  }

  const fileName = filePath?.split('/').pop();
  const directory = dirname(filePath);
  const workingDir = join(tmpdir(), 'tmpFiles');
  const tmpFilePath = join(workingDir, 'source.webp');

  // If file has already been resized or is not an image (e. g. : trailer), exit the function
  if (fileName?.includes('bf@') || !data.contentType?.includes('image')) {
    console.log('File already resized or file is not an image, exiting function');
    return false;
  }

  await fs.ensureDir(workingDir);
  await bucket.file(filePath).download({ destination: tmpFilePath });

  // Define the sizes (here width) depending of the image format (defined by the directory)
  let sizes: number[];

  // TODO#2603 Set resized images width depending of their directory
  switch (directory) {
    case 'avatar' || 'logo':
      sizes = [50, 100, 300];
      break;
    case 'poster':
      sizes = [100, 200];
      break;
    default:
      console.warn('No bucket directory, exiting function');
      return false;
  }

  // Iterate on each item of sizes array to generate all wanted resized images
  const uploadPromises = sizes.map(async size => {
    // Define a new name with prefix 'bf@' to recognize already resized images in the future
    const resizedImgName = `bf@${size}_${fileName}`;
    const resizedImgPath = join(workingDir, resizedImgName);

    // Use sharp to resize : take a path, resize to wanted size, save file to a new path.
    await sharp(tmpFilePath).resize(size).toFile(resizedImgPath);

    // Then upload the resized image on the bucket
    return bucket.upload(resizedImgPath, {
      destination: join(directory, resizedImgName)
    })
  })

  await Promise.all(uploadPromises);

  // Delete the temporary working directory after sucessfully uploading the resized images.
  return fs.remove(workingDir);
}
