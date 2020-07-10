import { Firestore, Storage } from '../admin';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { _upsertWatermark } from 'apps/backend-functions/src/internals/watermark';
import { chunk } from 'lodash'

const rowsConcurrency = 10;

/**
 * Migrate old ImgRef objects to new one.
 */
export async function upgrade(db: Firestore, storage: Storage) {
  console.log('//////////////');
  console.log('// Processing watermarks');
  console.log('//////////////');
  await db
    .collection('users')
    .get()
    .then(async users => await updateWatermarks(users, storage));

  console.log('Updated watermark.');
}

async function updateWatermarks(
  users: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  _: Storage
) {
  return runChunks(users.docs, async (doc) => {
    const updatedUser = await updateUserWaterMark(doc.data() as PublicUser);
    await doc.ref.set(updatedUser);
  });
}

const updateUserWaterMark = async (user: PublicUser) => {
  try {
    const watermark = await _upsertWatermark(user);
    user.watermark = watermark;
  } catch (e) {
    console.log(`Error while updating user ${user.uid} watermark. Reason: ${e.message}`);
  }

  return user;
};

async function runChunks(docs, cb) {
  const chunks = chunk(docs, rowsConcurrency);
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    console.log(`Processing chunk ${i + 1}/${chunks.length}`);
    const promises = c.map(cb);
    await Promise.all(promises);
  }
}
