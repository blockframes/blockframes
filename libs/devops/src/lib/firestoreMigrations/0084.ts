import { Firestore, removeAllSubcollections, runChunks } from '@blockframes/firebase-utils';
import { Movie } from '@blockframes/model';

/**
 * Remove DistributionRights sub-collection from old movies
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  await updateMovies(db);
  return updatePermissions(db);
}

async function updateMovies(db: Firestore) {
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    // Remove Sub Collection
    const subCollection = await doc.ref.listCollections();

    if (subCollection !== []) {
      const batch = db.batch();
      await removeAllSubcollections(doc, batch, db, { verbose: false });
      await batch.commit();
    }

    // Update Certifications
    const movie = doc.data() as Movie;

    movie.certifications = movie.certifications.filter(c => !['artEssai', 'awardedFilm', 'aListCast'].includes(c));

    // Remove atributes: 'reviews', 'ratings', 'boxoffice'
    delete (movie as any).boxoffice;
    delete (movie as any).reviews;
    delete (movie as any).ratings;

    await doc.ref.set(movie);
  }).catch(err => console.error(err));
}

async function updatePermissions(db: Firestore) {
  const permissions = await db.collection('permissions').get();

  return runChunks(permissions.docs, async (doc) => {
    const permission = doc.data() as Permissions;

    //Remove unused fields from permissions
    delete (permission as any).canCreate;
    delete (permission as any).canRead;
    delete (permission as any).canUpdate;
    delete (permission as any).canDelete;

    await doc.ref.set(permission);
  }).catch(err => console.error(err));
}

