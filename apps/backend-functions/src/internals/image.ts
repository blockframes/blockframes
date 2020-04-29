import { functions } from './firebase';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { Storage } from '@google-cloud/storage';
import { ensureDir, remove } from 'fs-extra';
import sharp from 'sharp';

/**
 * This function is executed on every files uploaded on the storage.
 * Here we use it to resize images, but it can also be used to perform
 * any kind of image manipulation (like blur, crop...).
 */
export async function onFileUploadEvent(data: functions.storage.ObjectMetadata) {

  // If the type of the data is not an image, exit the function
  if (!data.contentType?.includes('image')) {
    console.log('File is not an image, exiting function');
    return false;
  }

  // we don't want to resize a vector image because:
  // 1) vector are resizable at will by design
  // 2) it will crash the resize program
  if (data.contentType === 'image/svg+xml') {
    console.log('File is an SVG image, exiting function');
    return false;
  }

  try {
    // Resize the image
    await resize(data);

    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
}

async function resize(data: functions.storage.ObjectMetadata) {
  // Get all the needed informations from the data (bucket, path, file name and directory)
  const storage = new Storage()
  const bucket = storage.bucket(data.bucket)
  const filePath = data.name;
  const fileName = filePath?.split('/').pop();

  // If file has already been resized or is not an image (e. g. : trailer), exit the function
  if (fileName?.includes('bf@') || !filePath) {
    console.log('File already resized, exiting function');
    return false;
  }
  const directory = dirname(filePath);
  console.log('DIRECTORY NAME = ', directory)
  const workingDir = join(tmpdir(), 'tmpFiles');
  const tmpFilePath = join(workingDir, 'source.webp');

  // Ensure directory exists with fs.ensureDir
  await ensureDir(workingDir);
  await bucket.file(filePath).download({ destination: tmpFilePath });

  // Define the sizes (here width) depending of the image format (defined by the directory)
  let sizes: {
    xs: number,
    md: number,
    lg: number
  }

  // TODO#2603 Set resized images width depending of their directory
  if (directory === 'avatar' || directory === 'logo') {
    sizes = { xs: 50, md: 100, lg: 300 };
  } else if (directory.endsWith('poster')) {
    sizes = { xs: 200, md: 400, lg: 600 };
  } else if (directory.endsWith('banner')) {
    sizes = { xs: 300, md: 600, lg: 1200 };
  } else if (directory.endsWith('still')) {
    sizes = { xs: 50, md: 100, lg: 200 };
  } else {
    console.warn('No bucket directory, exiting function');
    return false;
  }



  // Iterate on each item of sizes array to generate all wanted resized images
  const uploadPromises = Object.entries(sizes).map(async ([key, size]) => {
    // Define a new name with prefix 'bf@' to recognize already resized images in the future
    const resizedImgName = `bf@${fileName!.replace(/(\.[\w\d_-]+)$/i, '')}_${size.toString()}.webp`;
    const resizedImgPath = join(workingDir, resizedImgName);

    // Use sharp to resize : take a path, resize to wanted size, save file to a new path
    await sharp(tmpFilePath).resize(size).toFile(resizedImgPath);

    // Then upload the resized image on the bucket
    return bucket.upload(resizedImgPath, {
      destination: join(directory, key, resizedImgName)
    })
  })

  await Promise.all(uploadPromises);

  // Delete the temporary working directory after successfully uploading the resized images with fs.remove
  return remove(workingDir);
}
