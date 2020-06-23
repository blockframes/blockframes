import { getWatermark } from '../templates/watermark';
import { PublicUser } from '../data/types';
import { admin, db, getStorageBucketName } from './firebase';
import { ImgRef } from '@blockframes/media/+state/media.firestore';

/**
 * - Generate a svg file with the name & email of the user
 * - Store the watermark file in the storage bucket
 * - Update the user's firestore doc to link it to the watermark file
 */
export async function upsertWatermark(user: PublicUser) {
  const watermark = await _upsertWatermark(user);
  const userRef = db.collection('users').doc(user.uid);
  return userRef.update({ watermark });
}

export async function _upsertWatermark(user: PublicUser): Promise<ImgRef> {

  if (!user.email) {
    throw new Error(`Cannot generate watermark for user ${user.uid} because 'email' is not provided.`);
  }

  const watermark = getWatermark(user.email, user.firstName, user.lastName);

  const ref = `watermark/${user.uid}.svg`;
  const file = admin.storage().bucket(getStorageBucketName()).file(ref);

  await new Promise(res => {
    file.createWriteStream({ contentType: 'image/svg+xml' }).end(watermark, () => res());
  });

  const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: '01-01-3000', version: 'v2' });

  const watermarkImgRef = {
    ref,
    url: signedUrl,
  }

  return watermarkImgRef;
}
