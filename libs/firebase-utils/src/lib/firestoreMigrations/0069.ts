
import * as env from '@env';
import { Firestore, Storage } from '../types';
import { runChunks } from '../firebase-utils';

import { User } from '@blockframes/user/types';
import { privacies } from '@blockframes/utils/file-sanitizer';
import { StorageFile } from '@blockframes/media/+state/media.firestore';

export const { storageBucket } = env.firebase();

interface OldUser extends User {
  watermark: StorageFile;
}

/**
 * Remove all watermarks from user documents and DB
 * @param db
 * @param storage
 * @returns
 */
export async function upgrade(db: Firestore, storage: Storage) {

  const users = await db.collection('users').get();
  await runChunks(users.docs, async doc => {
    const user = doc.data() as OldUser;
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
      }
    }

    if (user.watermark) {
      delete user.watermark;
      await doc.ref.set(user);
    }

  },
  ).catch(err => console.error(err));
}

console.log('watermarks removed !');
