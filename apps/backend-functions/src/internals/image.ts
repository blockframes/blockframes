import { db, functions } from './firebase';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import * as admin from 'firebase-admin';
import { ensureDir, remove } from 'fs-extra';
import sharp from 'sharp';
import {get, set} from 'lodash';
import { ImgRef } from '@blockframes/utils/media/media.firestore';

/**
 * This function is executed on every files uploaded on the storage.
 * Here we use it to resize images, but it can also be used to perform
 * any kind of image manipulation (like blur, crop...).
 */
export async function onFileUploadEvent(data: functions.storage.ObjectMetadata) {

  // If the type of the data is not an image, exit the function
  if (!data.contentType?.includes('image')) {
    console.log(`File ${data.contentType} is not an image, exiting function`);
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
    console.log(err);
    return false;
  }
}

async function resize(data: functions.storage.ObjectMetadata) {
  // Get all the needed information from the data (bucket, path, file name and directory)
  const bucket = admin.storage().bucket(data.bucket);
  const filePath = data.name;

  if (filePath === undefined) {
    throw new Error('undefined data.name!');
  }

  const filePathElements = filePath.split('/')

  if (filePathElements.length !== 5) {
    throw new Error('unhandled filePath:' + filePath);
  }

  const [collection, id, fieldToUpdate, uploadedSize, fileName] = filePathElements;

  if (uploadedSize !== 'original') {
    console.info('skipping upload that is not "original": ' + uploadedSize);
    return;
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

  if (directory.includes('avatar')) {
    sizes = { xs: 50, md: 100, lg: 300 };
  } else if (directory.includes('logo')) {
    sizes = { xs: 50, md: 100, lg: 300 };
  } else if (directory.includes('poster')) {
    sizes = { xs: 200, md: 400, lg: 600 };
  } else if (directory.includes('banner')) {
    sizes = { xs: 300, md: 600, lg: 1200 };
  } else if (directory.includes('still')) {
    sizes = { xs: 50, md: 100, lg: 200 };
  } else {
    console.warn('No bucket directory, exiting function');
    return false;
  }

  // Iterate on each item of sizes array to generate all wanted resized images
  const uploadPromises = Object.entries(sizes).map(async ([key, size]) => {
    const resizedImgName = fileName;
    const resizedImgPath = join(workingDir, `${key}_${resizedImgName}`);
    const destination = join(directory.replace('original', key), resizedImgName);

    // Use sharp to resize : take a path, resize to wanted size, save file to a new path
    await sharp(tmpFilePath)
      .resize(size)
      .toFile(resizedImgPath);

    const file = bucket.file(destination);
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '01-01-3000',
      version: 'v2',
    });

    // Then upload the resized image on the bucket
    await bucket.upload(resizedImgPath, {
      destination
    });

    return { key, url: signedUrl };
  });

  const uploaded = await Promise.all(uploadPromises);

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(db.doc(`${collection}/${id}`));
    const docData = await doc.data();

    if (docData === undefined) {
      throw new Error('Data is undefined');
    }

    const  original = (get(docData, fieldToUpdate) as ImgRef).urls.original;

    // format an array of {key, value}[] into a record of {key1: value1, key2: value2, ...}
    const uploadedUrl: Record<string, string> = {}
    for (const { key, url } of  uploaded) {
      uploadedUrl[key] = url;
    }

    const value = {
      ref: filePath,

      urls: {
        ...uploadedUrl,
        original,
      }
    }

    const updated = set(docData, fieldToUpdate, value);
    return tx.set(doc.ref, updated);
  })

  // Delete the temporary working directory after successfully uploading the resized images with fs.remove
  return remove(workingDir);
}
