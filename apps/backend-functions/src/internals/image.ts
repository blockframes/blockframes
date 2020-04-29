import { db, functions } from './firebase';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import * as admin from 'firebase-admin';
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
    // TODO: Add sentry to handle errors
    console.log(err.message);
    return false;
  }
}

async function resize(data: functions.storage.ObjectMetadata) {
  // Get all the needed informations from the data (bucket, path, file name and directory)
  const bucket = admin.storage().bucket(data.bucket);
  const filePath = data.name;
  const fileName = filePath?.split('/').pop();
  const id = filePath?.split('/')[1];
  const collection = filePath?.split('/')[0];

  // If file has already been resized or is not an image (e. g. : trailer), exit the function
  if (fileName?.includes('bf@') || !filePath) {
    console.log('File already resized, exiting function');
    return false;
  }
  const directory = dirname(filePath);
  const workingDir = join(tmpdir(), 'tmpFiles');
  const tmpFilePath = join(workingDir, 'source.webp');

  // Ensure directory exists with fs.ensureDir
  await ensureDir(workingDir);
  await bucket.file(filePath).download({ destination: tmpFilePath });

  // Define the sizes (here width) depending of the image format (defined by the directory)
  let sizes: {
    xs: number;
    md: number;
    lg: number;
  };

  let fieldToUpdate: string;

  if (directory.includes('avatar')) {
    sizes = { xs: 50, md: 100, lg: 300 };
    fieldToUpdate = 'avatar';
  } else if (directory.includes('logo')) {
    sizes = { xs: 50, md: 100, lg: 300 };
    fieldToUpdate = 'logo';
  } else if (directory.includes('poster')) {
    sizes = { xs: 200, md: 400, lg: 600 };
    fieldToUpdate = 'promotionalElements.poster[0].media';
  } else if (directory.includes('banner')) {
    sizes = { xs: 300, md: 600, lg: 1200 };
    fieldToUpdate = 'promotionalElements.banner.media';
  } else if (directory.includes('still')) {
    sizes = { xs: 50, md: 100, lg: 200 };
    fieldToUpdate = 'media';
  } else {
    console.warn('No bucket directory, exiting function');
    return false;
  }

  // Iterate on each item of sizes array to generate all wanted resized images
  const uploadPromises = Object.entries(sizes).map(async ([key, size]) => {
    // Define a new name with prefix 'bf@' to recognize already resized images in the future
    const resizedImgName = `bf@$${fileName}`;
    const resizedImgPath = join(workingDir, `${key}${resizedImgName}`);
    const destination = join(directory.replace('original', key), resizedImgName);

    // Use sharp to resize : take a path, resize to wanted size, save file to a new path
    await sharp(tmpFilePath)
      .resize(size)
      .toFile(resizedImgPath);

    const file = bucket.file(destination);
    const signedUrl = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    });

    // Then upload the resized image on the bucket
    await bucket.upload(resizedImgPath, {
      destination
    });

    return { key, url: signedUrl[0] };
  });

  const uploaded = await Promise.all(uploadPromises);

  const updatedDocument = {
    [fieldToUpdate]: {
      ref: filePath,
      urls: uploaded.reduce((prev, { key, url }) => {
        return { ...prev, [key]: url };
      }, {})
    }
  };

  await db.doc(`${collection}/${id}`).update(updatedDocument);

  // Delete the temporary working directory after successfully uploading the resized images with fs.remove
  return remove(workingDir);
}
