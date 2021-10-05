import * as admin from 'firebase-admin';
import { PublicUser } from '@blockframes/user/types';
import { Privacy } from '@blockframes/utils/file-sanitizer';
import { createStorageFile } from '@blockframes/media/+state/media.firestore';

export function getWatermark(email: string, firstName: string = '', lastName: string = '') {
  return `
    <svg id="jwplayer-user-watermark" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg">
      <style>
        #jwplayer-user-watermark text { text-anchor: end; }
        #jwplayer-user-watermark .name { font: 32px Arial; }
        #jwplayer-user-watermark .email { font: italic 24px Arial;}
      </style>
      <text x="100%" y="35%" fill="#fff" stroke="#000" class="name">${firstName} ${lastName}</text>
      <text x="100%" y="25%" fill="#fff" stroke="#000" class="email">${email}</text>
    </svg>
  `;
}


/**
 * - Generate a svg file with the name & email of the user
 * - Store the watermark file in the storage bucket
 * - Update the user document
 */
export async function upsertWatermark(user: PublicUser, bucketName: string, storage?: admin.storage.Storage): Promise<any> {
  const privacy: Privacy = 'public';
  if (!user.email) {
    throw new Error(`Cannot generate watermark for user ${user.uid} because 'email' is not provided.`);
  }

  const watermark = getWatermark(user.email, user.firstName, user.lastName);
  const randomStr = Math.random().toString(36).substr(2);
  const storagePath = `users/${user.uid}/watermark/${user.uid}-${randomStr}.svg`;
  const ref = `${privacy}/${storagePath}`;
  const file = storage ? storage.bucket(bucketName).file(ref) : admin.storage().bucket(bucketName).file(ref);
  const metadata = { metadata: { uid: user.uid, privacy, collection: 'users', field: 'watermark', docId: user.uid } };

  await file.save(watermark, { metadata });

  const db = admin.firestore();
  const doc = db.collection('users').doc(user.uid);
  const storageFile = createStorageFile({ storagePath, privacy, collection: 'users', field: 'watermark', docId: user.uid });
  await doc.update({ watermark: storageFile });

  return file;
}
