import { getWatermark } from '../templates/watermark';
import { PublicUser } from '../data/types';
import { admin, db, getStorageBucketName } from './firebase';

/**
 * - Generate a svg file with the name & email of the user
 * - Store the watermark file in the storage bucket
 * - Update the user's firestore doc to link it to the watermark file
 */
export async function upsertWatermark(user: PublicUser) {

  if (!user.firstName || !user.lastName) {
    throw new Error(`Cannot generate watermark for user ${user.uid} because 'firstName' and/or 'lastName' is/are not set!`);
  }

  const watermark = getWatermark(user.firstName, user.lastName, user.email);

  const ref = `watermark/${user.uid}.svg`;
  const file = admin.storage().bucket(getStorageBucketName()).file(ref);

  await new Promise(res => {
    file.createWriteStream({contentType: 'image/svg+xml'}).end(watermark, () => res());
  });

  const signedUrl = await file.getSignedUrl({action: 'read', expires: '01-01-3000', version: 'v2'});

  user.watermark = {
    originalFileName: `${user.uid}.svg`,
    originalRef: '',
    ref,
    url: signedUrl[0],
  }

  const userRef = db.collection('users').doc(user.uid);
  return userRef.update({watermark: user.watermark});
}
