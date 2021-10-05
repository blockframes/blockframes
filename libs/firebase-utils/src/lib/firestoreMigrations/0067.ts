
import * as env from '@env';
import { Firestore, Storage } from '../types';
import { runChunks } from '../firebase-utils';

import { getCollectionInBatches, upsertWatermark } from '@blockframes/firebase-utils';
import { User } from '@blockframes/user/types';
import { privacies } from '@blockframes/utils/file-sanitizer';

export const { storageBucket } = env.firebase();

/**
 * Update all watermarks with new ref
 * @param db
 * @param storage
 * @returns
 */
export async function upgrade(db: Firestore, storage: Storage) {

  const usersBatch = getCollectionInBatches<User>(db.collection('users'), 'uid');
  for await (const users of usersBatch) {
    await runChunks(
      users,
      async (user: User) => {

        if (user.watermark?.storagePath) {
          // Remove previous watermark file on storage
          let storagePath = user.watermark.storagePath;

          if (privacies.some(privacy => privacy === storagePath?.split('/').shift())) {
            storagePath = storagePath?.split('/').splice(1).join('/');
          }

          const fileObject = storage.bucket(storageBucket).file(`${user.watermark.privacy}/${storagePath}`);
          const [exists] = await fileObject.exists();
          if (exists) {
            await fileObject.delete();
          } else {
            console.log(`watermark file ${storagePath} not found on storage`);
          }

          // Generate new one and update user document
          return upsertWatermark(user, storageBucket, storage);
        }

      },
    ).catch(err => console.error(err));
  }

  console.log('watermarks updated !');
}
