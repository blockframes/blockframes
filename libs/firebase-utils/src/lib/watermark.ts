import * as admin from 'firebase-admin';
import { PublicUser } from '@blockframes/user/types';
import { Privacy } from '@blockframes/utils/file-sanitizer';

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
 * This function delete the watermark file in the storage, then await for the change to be
 * propagated on the firestore db
 */
export async function deleteAndAwaitWatermark(userId: string, bucketName: string): Promise<any> {
  const ref = `users/${userId}/watermark/${userId}.svg`;
  const file = admin.storage().bucket(bucketName).file(ref);

  const [exists] = await file.exists();

  if (exists) {
    file.delete();
    const userRef = admin.firestore().collection('users').doc(userId);
    const success = await new Promise(resolve => {

      const unsubscribe = userRef.onSnapshot(doc => {
        const user = doc.data() as PublicUser;
        if (!user.watermark) {
          unsubscribe();
          resolve(true);
        }
      });

      setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, 10000);

    });

    if (!success) {
      throw new Error('Delete Watermark has timeout, please try again.');
    }
  }
}

/**
 * - Generate a svg file with the name & email of the user
 * - Store the watermark file in the storage bucket
 * - Update the user document
 */
export async function upsertWatermark(user: PublicUser, bucketName: string, storage?: admin.storage.Storage, privacy : Privacy = 'public'): Promise<any> {

  if (!user.email) {
    throw new Error(`Cannot generate watermark for user ${user.uid} because 'email' is not provided.`);
  }

  const watermark = getWatermark(user.email, user.firstName, user.lastName);

  const ref = `${privacy}/users/${user.uid}/watermark/${user.uid}.svg`;
  const file = storage ? storage.bucket(bucketName).file(ref) : admin.storage().bucket(bucketName).file(ref);

  await new Promise(res => {
    file.createWriteStream({ contentType: 'image/svg+xml' }).end(watermark, () => res());
  });

  const db = admin.firestore();
  const doc = await db.collection('users').doc(user.uid);
  await doc.update({ watermark: ref });

  return file;
}
