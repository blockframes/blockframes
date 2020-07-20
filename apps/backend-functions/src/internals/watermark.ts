import { getWatermark } from '../templates/watermark';
import { PublicUser } from '../data/types';
import { admin, getStorageBucketName } from './firebase';
import { HostedMedia } from '@blockframes/media/+state/media.firestore';

/**
 * - Generate a svg file with the name & email of the user
 * - Store the watermark file in the storage bucket
 * - User's firestore doc is updated by onFileUpload backend function
 */
export async function upsertWatermark(user: PublicUser): Promise<HostedMedia> {

  if (!user.email) {
    throw new Error(`Cannot generate watermark for user ${user.uid} because 'email' is not provided.`);
  }

  const watermark = getWatermark(user.email, user.firstName, user.lastName);

  const ref = `users/${user.uid}/watermark/${user.uid}.svg`;
  const file = admin.storage().bucket(getStorageBucketName()).file(ref);

  await new Promise(res => {
    file.createWriteStream({ contentType: 'image/svg+xml' }).end(watermark, () => res());
  });

  const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: '01-01-3000', version: 'v2' });

  const watermarkMedia = {
    ref,
    url: signedUrl,
  }

  return watermarkMedia;
}
