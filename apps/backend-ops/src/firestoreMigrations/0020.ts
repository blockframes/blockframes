import { Firestore } from '../admin';
import { PublicUser } from '@blockframes/user/types';
import { upsertWatermark } from '../../../backend-functions/src/internals/watermark';

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
        await upsertWatermark(userData);
      }
    }
  );
  await Promise.all(promises);
  console.log('Watermarks have been created for each users.');
}
