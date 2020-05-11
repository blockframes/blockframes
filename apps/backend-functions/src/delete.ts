import { db } from './internals/firebase';
import { removeAllSubcollections } from './utils';
import { getDocument } from './data/internals';
import { OrganizationDocument } from './data/types';

export async function deleteFirestoreMovie(snap: FirebaseFirestore.DocumentSnapshot) {
  const movie = snap.data();

  if (!movie) {
    throw new Error(`This movie doesn't exist !`);
  }

  /**
   *  When a movie is deleted, we also delete its sub-collections and references in other collections/documents.
   *  As we delete all deliveries linked to a movie, deliveries sub-collections and references will also be
   *  automatically deleted in the process.
   */

  const batch = db.batch();

  const organizations = await db.collection(`orgs`).get();
  // TODO: .where('movieIds', 'array-contains', movie.id) doesn't seem to work. => ISSUE#908

  organizations.forEach(async doc => {
    const organization = await getDocument<OrganizationDocument>(`orgs/${doc.id}`);

    if (organization.movieIds.includes(movie.id)) {
      console.log(`delete movie id reference in organization ${doc.data().id}`);
      batch.update(doc.ref, {
        movieIds: doc.data().movieIds.filter((movieId: string) => movieId !== movie.id)
      });
    }
  });

  // Delete sub-collections
  await removeAllSubcollections(snap, batch);
  console.log(`removed sub colletions of ${movie.id}`);
  return batch.commit();
}
