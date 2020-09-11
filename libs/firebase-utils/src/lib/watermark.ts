
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
 * - Generate a svg file with the name & email of the user
 * - Store the watermark file in the storage bucket
 * - Update the user document
 */
export async function upsertWatermark(user: PublicUser, bucketName: string, privacy : Privacy = 'public'): Promise<any> {

  if (!user.email) {
    throw new Error(`Cannot generate watermark for user ${user.uid} because 'email' is not provided.`);
  }

  const watermark = getWatermark(user.email, user.firstName, user.lastName);

  const ref = `${privacy}/users/${user.uid}/watermark/${user.uid}.svg`;
  const file = admin.storage().bucket(bucketName).file(ref);

  await new Promise(res => {
    file.createWriteStream({ contentType: 'image/svg+xml' }).end(watermark, () => res());
  });

  const db = admin.firestore();
  const doc = await db.collection('users').doc(user.uid);
  await doc.update({ watermark: ref });

  return file;
}
