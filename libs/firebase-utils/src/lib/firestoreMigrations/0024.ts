import { Firestore } from '../types';
import { PublicUser } from '@blockframes/user/types';
import { upsertWatermark } from '../watermark';
import { firebase } from '@env';
export const { storageBucket } = firebase();

/**
 * Creating a watermark image for each user and store it into storage /watermark/<UID>.svg
 */
export async function upgrade(db: Firestore) {
  const users = await db.collection('users').get();

  const promises = users.docs.map(
    async (userSnapshot): Promise<any> => {
      const userData = userSnapshot.data() as PublicUser;

      if (!!userData) {
        // create watermark file & update user's firestore doc
        try {
          await upsertWatermark(userData, storageBucket);
        } catch (e) {
          console.error(e);
        }
      }
    }
  );
  await Promise.all(promises);
  console.log('Watermarks have been created for each users.');
}
