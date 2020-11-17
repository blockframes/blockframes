import { db } from './internals/firebase';
import { removeAllSubcollections } from './utils';
import { getDocument } from './data/internals';
import { OrganizationDocument } from './data/types';

export async function deleteFirestoreMovie(snap: FirebaseFirestore.DocumentSnapshot) {
  const movie = snap.data();

  if (!movie) {
    throw new Error(`This movie doesn't exist !`);
  }

  const batch = db.batch();

  // Delete sub-collections
  await removeAllSubcollections(snap, batch);
  console.log(`removed sub colletions of ${movie.id}`);
  return batch.commit();
}
