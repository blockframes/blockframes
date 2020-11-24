import { Firestore } from '@blockframes/firebase-utils';
import { runChunks } from '../firebase-utils';

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

export async function upgrade(db: Firestore) {
  const orgs = await db.collection('orgs').get();

  return runChunks(orgs.docs, async (doc) => {
    const org = doc.data();

    let newWishlist = [];
    if (org.wishlist?.length) {
      org.wishlist.forEach(list => {
        if (list.movieIds?.length) {
          newWishlist = newWishlist.concat(list.movieIds);
        }
      })
    }

    org.wishlist = newWishlist.filter(onlyUnique);

    await doc.ref.set(org);
  });

}
