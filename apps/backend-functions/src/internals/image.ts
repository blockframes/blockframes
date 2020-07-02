import { tmpdir } from 'os';
import { join, dirname, basename, extname } from 'path';
import * as admin from 'firebase-admin';
import { ensureDir, remove } from 'fs-extra';
import sharp from 'sharp';
import { getImgSize, imgSizeDirectory, ImgSizeDirectory, ImgRef } from '@blockframes/media/+state/media.firestore.ts';


export async function resize(ref: string) {

  const workingDir = join(tmpdir(), 'tmpFiles');
  const tmpFileName = ` ${Math.random().toString(36).substring(7)}-${new Date().getTime()}.webp`;
  const tmpFilePath = join(workingDir, tmpFileName);
  // Ensure directory exists with fs.ensureDir
  await ensureDir(workingDir);

  const bucket = admin.storage().bucket();
  const originalImage = bucket.file(ref);
  const [ exists ] = await originalImage.exists();

  if (!exists) {
    throw new Error(`Resize Error : The image to resize (${ref}) does not exists!`);
  }

  await originalImage.download({ destination: tmpFilePath });

  // Define the sizes (here width) depending of the image format (defined by the directory)
  const sizes = getImgSize(ref);
  const path = dirname(ref);
  const fileName = basename(ref);

  // Iterate on each item of sizes array to generate all wanted resized images
  const uploadPromises = imgSizeDirectory.filter(size => size !== 'fallback').map(async key => {

      const currentSize = sizes[key as ImgSizeDirectory];

      if (currentSize === 0) {
        throw new Error(`Resize Error : Cannot resize image ${ref} for size ${currentSize} because width is 0`);
      }

      const resizedImgName = fileName;
      const resizedImgPath = join(workingDir, `${key}_${resizedImgName}`);

        // In this condition, we need to resize the image
        const destination = join(path.replace('original', key), resizedImgName);
        // Use sharp to resize : take a path, resize to wanted size, save file to a new path
        await sharp(tmpFilePath)
          .resize(currentSize)
          .toFile(resizedImgPath);

        // Then upload the resized image on the bucket
        await bucket.upload(resizedImgPath, { destination });
    }
  );

  const uploadFallback = async () => {

    const fallbackImgName = basename(fileName, extname(fileName)) + '.png';
    const fallbackImgPath = join(workingDir, `fallback_${fallbackImgName}`);
    const storageDestination = join(path.replace('original', 'fallback'), fallbackImgName);

    await sharp(tmpFilePath) // load the image file into Sharp
    .png() // convert it into a .png
    .resize({width: sizes.fallback, withoutEnlargement: true}) // resize the image down to 1024 unless it's already smaller
    .toFile(fallbackImgPath); // write the image into a file

    await bucket.upload(fallbackImgPath, { destination: storageDestination });
  }

  uploadPromises.push(uploadFallback());

  await Promise.all(uploadPromises);

  // Delete the temporary working directory after successfully uploading the resized images with fs.remove
  return remove(workingDir);
}

/** Handle image resizing or image deletion */
export async function handleImageChange(after: ImgRef) {

  // image was deleted
  if (after.original.ref === '') {

    const bucket = admin.storage().bucket();

    // delete every image size (including `fallback`)
    const deletePromises = imgSizeDirectory.map(key => {

      // avoid to delete if ref is empty
      if (!!after[key]!.ref) {
        return bucket.file(after[key]!.ref).delete();
      } else {
        return new Promise(res => res());
      }

    });
    await Promise.all(deletePromises);

  // image was created or updated
  } else {
    await resize(after.original.ref);
  }

}
