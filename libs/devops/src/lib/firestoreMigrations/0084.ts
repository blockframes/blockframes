import { Firestore, removeAllSubcollections, runChunks } from '@blockframes/firebase-utils';
import { Movie, PermissionsDocument } from '@blockframes/model';
import { Bucket } from '@google-cloud/storage';

/**
 * Remove DistributionRights sub-collection from old movies
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  await updateMovies(db)
  await updateBuckets(db)
  return updatePermissions(db)
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
    if ((movie as any)?.boxoffice) delete (movie as any).boxoffice;
    if ((movie as any)?.reviews) delete (movie as any).reviews;
    if ((movie as any)?.ratings) delete (movie as any).ratings;

    await doc.ref.set(movie);
  }).catch(err => console.error(err));
}

async function updatePermissions(db: Firestore) {
  const permissions = await db.collection('permissions').get();

  return runChunks(permissions.docs, async (doc) => {
    const permission = doc.data() as PermissionsDocument;

    //Remove unused fields from permissions
    if (permission?.canCreate) delete permission.canCreate
    if (permission?.canRead) delete permission.canRead
    if (permission?.canUpdate) delete permission.canUpdate
    if (permission?.canDelete) delete permission.canDelete

    await doc.ref.set(permission);
  }).catch(err => console.error(err));
}

async function updateBuckets(db: Firestore) {
  const buckets = await db.collection('buckets').get();

  return runChunks(buckets.docs, async (doc) => {
    const bucket = doc.data() as any;

    if (bucket?.uid) delete bucket.uid

  }).catch(err => console.error(err));
}

