import { Firestore, removeAllSubcollections, runChunks } from '@blockframes/firebase-utils';
import { Organization, Invitation, Notification, PublicOrganization, Movie } from '@blockframes/model';
import { DocumentSnapshot } from 'firebase-functions/v1/firestore';


/**
 * Update name from organizations, invitations and notifications documents
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  return await deleteMoviesSubcollections(db);
}

async function deleteMoviesSubcollections(db: Firestore) {
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    const movie = await doc.data() as DocumentSnapshot;
    const subCollection = await doc.ref.listCollections();

    if (subCollection !== []) {
      const batch = db.batch();
      await removeAllSubcollections(doc, batch, db, { verbose: false });
      await batch.commit();
      await doc.ref.set(movie);
    }

  }).catch(err => console.error(err));
}
